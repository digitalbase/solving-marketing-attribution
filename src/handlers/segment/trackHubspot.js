// /src/handlers/segment/trackUser.js
const { withStatusCode } = require('../../utils/response.util');
const ok = withStatusCode(200, JSON.stringify);
const nok = withStatusCode(500, JSON.stringify);

const {SegmentTracking} = require('../../SegmentTracking');
const SegmentTracker = new SegmentTracking();

const Hubspot = require('hubspot');
const hubspot = new Hubspot({apiKey: process.env.HUBSPOT_API_KEY});

exports.handler = async (event) => {
    const { id, email } = event.pathParameters;

    try {
        let contact = await hubspot.contacts.getByEmail(email);
        contact = await hubspot.contacts.getByEmail(email);

        let user_properties = {
            first_name: contact.properties.firstname.value,
            last_name: contact.properties.lastname.value,
            created_at: contact.properties.createdate.value,
            company: (contact.properties.company && contact.properties.company.value) ? contact.properties.company.value : null,
            lead_status: (contact.properties.hs_lead_status && contact.properties.hs_lead_status.value) ? contact.properties.hs_lead_status.value : null,
            lifecycle_stage: (contact.properties.lifecyclestage && contact.properties.lifecyclestage.value) ? contact.properties.lifecyclestage.value : null,
            priority: (contact.properties.priority && contact.properties.priority.value) ? contact.properties.priority.value : null,
            meeting_status: (contact.properties.meeting_status && contact.properties.meeting_status.value) ? contact.properties.meeting_status.value : null,
            demo_by: (contact.properties.demo_done_by && contact.properties.demo_done_by.value) ? contact.properties.demo_done_by.value : null,
            //demo done by
            //priority
        };

        let lifecycle_changes = [];

        let user_is_sales_qualified = false;
        let user_is_marketing_qualified = false;

        if (contact.properties.lifecyclestage && contact.properties.lifecyclestage.versions) {
            contact.properties.lifecyclestage.versions.forEach((lifecycle_stage) => {
                if (lifecycle_stage.value === 'salesqualifiedlead') {
                    user_is_sales_qualified = true;
                }

                if (lifecycle_stage.value === 'marketingqualifiedlead') {
                    user_is_marketing_qualified = true;
                }
            });
        }

        let timeline = await hubspot.


            let deals = await getDeals(contact.vid);
        const [ last_deal ] = [...deals ].reverse(); //to not modify the original

        if (last_deal) {
            user_properties.last_deal_amount = last_deal.amount;
            user_properties.last_deal_currency = last_deal.currency;
            user_properties.last_deal_stage = last_deal.dealstage;
        }

        user_properties.is_sales_qualified = user_is_sales_qualified;
        user_properties.is_marketing_qualified = user_is_marketing_qualified;

        const user_identify_payload = {
            type: "identify",
            userId: id,
            active: false,
            ip: null,
            context: {
                active:false
            },
            traits: {
                lastSyncedSma: new Date(),
                ...user_properties
            },
        };

        await SegmentTracker.callSegment([ user_identify_payload ]);

    } catch (error) {

        if (error.statusCode === 404) {
            console.log('contact not found');
            return ok('contact not found');
        }

        console.log(error.message);
        return nok(error.message);
    }

    return ok('Track Completed');
};

async function getDeals(contact_id){
    let deals = await hubspot.deals.getAssociated("contact", contact_id);
    let all_deals = [];
    for (const deal of deals.deals) {
        let dealio = await hubspot.deals.getById(deal.dealId);
        all_deals.push({
            "name": dealio.properties.dealname.value,
            "amount": dealio.properties.amount.value,
            "currency": dealio.properties.deal_currency_code.value,
            "created_at": dealio.properties.createdate.value,
            "is_closed": dealio.properties.hs_is_closed.value,
            "dealstage": getDealStage(dealio.properties.dealstage.value),
            "closedate": dealio.properties.closedate.value,
            "dealtype": dealio.properties.dealtype.value
        });
    }
    return all_deals;
}
function getDealStage(id){
    let dealstage = [];
    dealstage['8e04c403-2a45-48f9-8f43-bd4969f13cff'] = 'Engaged';
    dealstage['adab8a2d-f5e2-4517-9f70-dc642e09fad1'] = 'Disco';
    dealstage['51ceaf87-44ec-45a7-bfb7-e4bdef0bd623'] = 'Demo';
    dealstage['825982'] = 'Trial';
    dealstage['1872965'] = 'On hold';
    dealstage['12c0c06b-3be0-4e51-bcd8-00e885109b95'] = 'Proposal';
    dealstage['87301417-2822-4b01-91b4-2ba524ee9a21'] = 'Negotiation';
    dealstage['a71e4111-aa77-4ca0-bfef-5f58de61c0cf'] = 'Procurement/IT/Legal';
    dealstage['7c536ff8-bc72-4540-96ed-43d4bcd732ba'] = 'Closed Won';
    dealstage['2c36415d-1268-4ce2-ac72-788d8e6a8b48'] = 'Closed Lost';
    dealstage['29ca8173-a62d-4516-9bd6-998dc6aeb053'] = 'Last try';

    return dealstage[id];
}