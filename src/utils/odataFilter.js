import { defaultParser } from "@odata/parser";

// Operator mapping from OData expression types to Wrike custom-field filter
// comparators.
//
// NOTE: `ne` intentionally maps to `NotInRange` with minValue === maxValue.
// Wrike's `customFields` filter does NOT support a `NotEqualTo` comparator
// (see the `CustomFieldComparator` enum in the Wrike OpenAPI spec), so
// "value NOT in range [X, X]" is the correct way to express "not equal to X".
const odataToCustomOp = {
  EqualsExpression: "EqualTo",
  NotEqualsExpression: "NotInRange",
  LesserThanExpression: "LessThan",
  LesserOrEqualsExpression: "LessOrEqualTo",
  GreaterThanExpression: "GreaterThan",
  GreaterOrEqualsExpression: "GreaterOrEqualTo",
  HasExpression: "Contains",
  startswith: "StartsWith",
  endswith: "EndsWith",
};

/**
 * Parse an OData `$filter` expression into Wrike `customFields` filter objects.
 *
 * @param {string} [filterParams] - Raw OData filter, e.g. "campaignname eq 'X'".
 * @param {Object} datahubCustomFieldsData - Short-code -> { cfId, ... } mapping.
 * @returns {Array<{id: string, comparator: string, value?: string, minValue?: string, maxValue?: string, values?: string[]}>}
 * @throws {{statusCode: 400, message: string}} For unsupported filters or fields.
 */
export const parseODataFilters = (filterParams, datahubCustomFieldsData) => {
  if (!filterParams) return [];

  const filters = defaultParser.filter(filterParams);
  if (!filters) {
    throw { statusCode: 400, message: "Request is not supported!" };
  }

  return extractFilters(filters, datahubCustomFieldsData);
};

function getFieldName(node, datahubCustomFieldsData) {
  if (!node) return { name: null, id: null };
  if (node.name) return resolveFieldName(node.name, datahubCustomFieldsData);
  if (node.value) return getFieldName(node.value, datahubCustomFieldsData);
  // Some parser nodes expose the identifier only via `raw` (e.g. the outer
  // FirstMemberExpression / MemberExpression / PropertyPathExpression levels),
  // so fall back to it when no `name` is found down the value chain.
  if (node.raw) return resolveFieldName(node.raw, datahubCustomFieldsData);
  return { name: null, id: null };
}

function resolveFieldName(name, datahubCustomFieldsData) {
  // Try an exact key match first, then a normalized (case-insensitive,
  // non-alphanumeric-stripped) match so filters work against short codes
  // regardless of casing or separators (e.g. "Campaign Name" -> "campaignname").
  let entry = datahubCustomFieldsData[name];
  let fieldKey = name;

  if (!entry) {
    const normalized = name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const match = Object.entries(datahubCustomFieldsData).find(
      ([key, val]) =>
        val?.shortcode === name ||
        key === name ||
        key.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() === normalized,
    );
    if (match) {
      entry = match[1];
      fieldKey = match[0];
    }
  }

  if (!entry) {
    throw {
      statusCode: 400,
      message: `Invalid filters: Field '${name}' is missing or incorrect.`,
    };
  }
  return { name: fieldKey, id: entry.cfId };
}

function getValues(type, leftValue, rightValue, datahubCustomFieldsData) {
  // Comparison node
  const { id } = getFieldName(leftValue, datahubCustomFieldsData);

  const comparator = odataToCustomOp[type];

  if (!comparator) {
    throw {
      statusCode: 400,
      message: `Invalid filters: Unsupported operator '${type}' for field '${id}'.`,
    };
  }

  // Wrike's `customFields` filter params (value/minValue/maxValue/values) are
  // string-typed per the OpenAPI spec, so keep the raw literal as a string.
  let value = rightValue.value;
  if (typeof value === "string" && value.startsWith("Edm.")) {
    value = rightValue.raw.replace(/^'|'$/g, "");
  } else if (typeof value === "string") {
    value = value.replace(/^'|'$/g, "");
  }
  const filterObj = { id, comparator };
  if (
    [
      "EqualTo",
      "LessThan",
      "LessOrEqualTo",
      "GreaterThan",
      "GreaterOrEqualTo",
      "Contains",
      "StartsWith",
      "EndsWith",
    ].includes(comparator)
  ) {
    filterObj.value = value;
  } else if (comparator === "InRange") {
    if (Array.isArray(value)) {
      if (value.length > 0) filterObj.minValue = value[0];
      if (value.length > 1) filterObj.maxValue = value[1];
    } else {
      filterObj.minValue = value;
      filterObj.maxValue = value;
    }
  } else if (comparator === "NotInRange") {
    filterObj.minValue = value;
    filterObj.maxValue = value;
  } else if (comparator === "ContainsAll" || comparator === "ContainsAny") {
    filterObj.values = Array.isArray(value) ? value : [value];
  }

  return filterObj;
}

function extractFilters(node, datahubCustomFieldsData, result = []) {
  if (!node) return result;
  if (node.type === "BoolParenExpression") {
    return extractFilters(node.value, datahubCustomFieldsData, result);
  }

  if (node.type === "OrExpression") {
    throw {
      statusCode: 400,
      message: "Invalid filters: OR expressions are not supported.",
    };
  }

  if (node.type === "MethodCallExpression") {
    if (Array.isArray(node.value.parameters)) {
      result.push(
        getValues(
          node?.value?.method,
          node.value.parameters[0],
          node.value.parameters[1],
          datahubCustomFieldsData,
        ),
      );
      return result;
    } else
      throw {
        statusCode: 400,
        message: `Invalid filters: Method call expression with parameters is not supported.`,
      };
  }

  if (node.type === "AndExpression" || node.type === "OrExpression") {
    extractFilters(node.value.left, datahubCustomFieldsData, result);
    extractFilters(node.value.right, datahubCustomFieldsData, result);
  } else if (odataToCustomOp[node.type]) {
    result.push(
      getValues(
        node.type,
        node.value.left,
        node.value.right,
        datahubCustomFieldsData,
      ),
    );
  } else
    throw {
      statusCode: 400,
      message: `Invalid filters: Unsupported operator '${node.type}'.`,
    };

  return result;
}
