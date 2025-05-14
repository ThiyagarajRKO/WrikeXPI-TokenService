import { GetResponse } from "../../../utils/node-fetch";
import { defaultParser } from "@odata/parser";
import customFieldIdMeta from "../utils/customFieldsIds";

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

      const customFieldIds = customFieldIdMeta["live"];

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

      const folderCustomFieldValues = {};

      for (const [key, value] of Object.entries(customFieldIds)) {
        const cfValue =
          wrikeFolderData?.data[0]?.customFields?.find(
            (field) => field.id === value
          )?.value ?? null;

        folderCustomFieldValues[key] = cfValue;
      }

      // Sending final response
      resolve({
        data: {
          type: "Campaign",
          campaignStartDate: folderCustomFieldValues["Campaign Start Date*"],
          campaignEndDate: folderCustomFieldValues["Campaign End Date*"],
          customfieldlist: wrikeFolderData?.customFields,
          noofcrs: 5,
          agency: folderCustomFieldValues["Agency*"],
          mediabuyingtype: "Biddable",
          brand: folderCustomFieldValues["Brand*"],
          briefeddate: folderCustomFieldValues["Briefed Date*"],
          campaignbudget: folderCustomFieldValues["Campaign Budget*"],
          campaignenddate: folderCustomFieldValues["Campaign End Date*"],
          campaignid: folderCustomFieldValues["Campaign ID*"],
          campaignname: folderCustomFieldValues["Campaign Name*"],
          campaignobjective: folderCustomFieldValues["Campaign Objective*"],
          campaignstartdate: folderCustomFieldValues["Campaign Start Date*"],
          campaignfeedbackstatus:
            folderCustomFieldValues["CampaignFeedbackStatus*"],
          ccuid: folderCustomFieldValues["CCUID*"],
          mediachannelpractice: "",
          client: folderCustomFieldValues["Client*"],
          comments: "",
          cssid: folderCustomFieldValues["CSSID*"],
          currency: folderCustomFieldValues["Currency"],
          customerponumber: "",
          debtor: folderCustomFieldValues["Debtor*"],
          kpiobjective: folderCustomFieldValues["KPI Objective*"],
          originalagency: folderCustomFieldValues["Original Agency*"],
          readyforarchive: folderCustomFieldValues["ReadyForArchive*"],
          region: folderCustomFieldValues["Region*"],
          requestedstartdate: folderCustomFieldValues["Requested Start Date*"],
          requestormarket: folderCustomFieldValues["Requestor's Market*"],
          spacename: folderCustomFieldValues["Space Name*"],
          workitemlevel: folderCustomFieldValues["Work Item Level"],
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
