import { GetResponse } from "../../../utils/node-fetch";
import { defaultParser } from "@odata/parser";

const customFieldsMeta = {
  "Campaign Name*": { id: "IEABCEFLJUAEF4AO", key: "campaignName" },
  "Campaign Objective*": { id: "IEABCEFLJUAEF4B7", key: "campaignObjective" },
  "Campaign Start Date*": { id: "IEABCEFLJUAEF4BI", key: "campaignStartDate" },
  "Campaign End Date*": { id: "IEABCEFLJUAEF4BJ", key: "campaignEndDate" },
  "Biddable Nonbiddable*": { id: "", key: "biddableNonbiddable" },
  "Currency*": { id: "IEABCEFLJUAEGPM6", key: "currency" },
  "Campaign Budget*": { id: "IEABCEFLJUAEGZFP", key: "campaignBudget" },
  "Requestor Market*": { id: "", key: "requestorMarket" },
  "Agency*": { id: "IEABCEFLJUAEF4AI", key: "agency" },
  "Client*": { id: "IEABCEFLJUAEF4AK", key: "client" },
  "Debtor*": { id: "IEABCEFLJUAEGGC3", key: "debtor" },
  "Brand*": { id: "IEABCEFLJUAEF4AJ", key: "brand" },
  "CSSID*": { id: "IEABCEFLJUAGCS2I", key: "cssid" },
  "CCUID*": { id: "IEABCEFLJUAGCS2J", key: "ccuid" },
};

export const GetCampaign = (wrikeToken, params, fastify) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!wrikeToken)
        return reject({
          statusCode: 403,
          message:
            "Failed authorization! User is not authorized to access the service.",
        });

      // Variable Declaration
      const { campaignId: folderId, filter: filterParams } = params;

      if (!folderId)
        return reject({
          statusCode: 400,
          message:
            "Missing parameter! Required parameter is missing for the requested operation.",
        });

      let filters;

      if (filterParams) {
        filters = defaultParser.filter(filterParams);

        if (!filters)
          return reject({
            statusCode: 400,
            message: "Request is not supported!",
          });
      }

      // // let customFields = [];

      // // // Constructing CF values
      // // await Promise.all(
      // //   Object.keys(customFieldsMeta)?.map((data) => {
      // //     const currentData = customFieldsMeta[data];
      // //     if (currentData?.id) {
      // //       customFields.push({
      // //         id: currentData?.id,
      // //         value: wrikeCampaign[currentData?.key],
      // //       });
      // //     }
      // //   })
      // // );

      // Get folder data
      const wrikeFolderData = await GetResponse(
        `${process.env.WRIKE_ENDPOINT}/folders/${folderId}`,
        "GET",
        {
          "content-type": "application/json",
          Authorization: `Bearer ${wrikeToken}`,
        }
      );

      // Sending folder update error response
      if (wrikeFolderData?.errorDescription) {
        return reject({ message: wrikeFolderData?.errorDescription });
      }

      // Sending final response
      resolve({
        data: {
          wrikeFolderData,
          type: "Campaign",
          campaignStartDate: "",
          campaignEndDate: "",
          customfieldlist: [],
          noofcrs: 5,
          agency: "Mindshare",
          mediabuyingtype: "Biddable",
          brand: "",
          briefeddate: "2025-01-24",
          campaignbudget: 1200,
          campaignenddate: "2025-04-02",
          campaignid: "",
          campaignname: "Go Wrike Way Promotion",
          campaignobjective: "",
          campaignstartdate: "2025-02-22",
          campaignfeedbackstatus: "",
          ccuid: "",
          mediachannelpractice: "",
          client: "",
          comments: "",
          cssid: "",
          currency: "",
          customerponumber: "",
          debtor: "",
          kpiobjective: "",
          originalagency: "",
          readyforarchive: "Completed",
          region: "",
          requestedstartdate: "2025-01-11",
          requestormarket: "Malaysia",
          spacename: "GRM-MYS-GMN",
          workitemlevel: "Campaign",
        },
      });
    } catch (err) {
      console.log(err?.message || err);
      reject({
        message:
          "Fatal error Unexpected error occurred and service is unable complete the request.",
      });
    }
  });
};
