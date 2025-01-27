import type * as schema from "./schema"

type Problem = typeof schema.problems.$inferSelect
type Message = typeof schema.messages.$inferSelect
type Thread = typeof schema.threads.$inferSelect
type Team = typeof schema.teams.$inferSelect

type ThreadTemplate = {
	subject: Thread["subject"]
	messages: Array<Pick<Message, "type" | "content">>
}

// Problem with team name instead of ID for initial seeding
type ProblemWithTeamName = Omit<
	Problem,
	"id" | "createdAt" | "updatedAt" | "teamId"
> & {
	teamName: string | null
}

export const initialTeams: Omit<Team, "id" | "createdAt" | "updatedAt">[] = [
	{
		name: "Technical Support"
	},
	{
		name: "Customer Success"
	},
	{
		name: "Platform & Security"
	}
]

export const initialProblems: ProblemWithTeamName[] = [
	{
		title: "Login Authentication",
		description:
			"Issues related to user login, authentication failures, password resets, and account access",
		teamName: "Platform & Security"
	},
	{
		title: "Billing & Payments",
		description:
			"Questions about invoices, payment processing, subscription changes, and refunds",
		teamName: "Customer Success"
	},
	{
		title: "API Integration",
		description:
			"Technical support for API usage, webhooks, rate limits, and integration issues",
		teamName: "Technical Support"
	},
	{
		title: "Data Export",
		description:
			"Assistance with exporting data, file formats, and bulk operations",
		teamName: "Technical Support"
	},
	{
		title: "Performance Issues",
		description:
			"Reports of slow loading times, timeouts, or system performance problems",
		teamName: "Platform & Security"
	},
	{
		title: "Feature Requests",
		description:
			"User suggestions for new features or improvements to existing functionality",
		teamName: "Customer Success"
	}
]

export const supportThreads: ThreadTemplate[] = [
	{
		subject: "Cannot log in - 2FA issues",
		messages: [
			{
				type: "email",
				content:
					"Hi, I'm unable to log in to my account. The 2FA code isn't being sent to my phone number. I've tried multiple times but no SMS is coming through."
			},
			{
				type: "staff",
				content:
					"Hello! I'm sorry you're having trouble with 2FA. Let me help you with that. Could you confirm if your phone number ending in *1234 is still correct?"
			},
			{
				type: "email",
				content:
					"Actually, I changed my phone number recently. That might be why I'm not getting the codes. How can I update it?"
			},
			{
				type: "staff",
				content:
					"I can help you update your phone number. For security purposes, I'll need to verify your identity first. I've sent a verification link to your email address. Once you click that, we can proceed with updating your phone number."
			}
		]
	},
	{
		subject: "API rate limit exceeded",
		messages: [
			{
				type: "email",
				content:
					"We're getting rate limit errors on our API calls since this morning. Our typical volume hasn't changed, but suddenly we're hitting limits. This is affecting our production system."
			},
			{
				type: "staff",
				content:
					"I understand this is impacting your production system. I've checked your account and I notice your API usage has spiked significantly in the past hour. Are you seeing any unusual patterns in your requests?"
			},
			{
				type: "email",
				content:
					"Just checked with our team - we found a bug in our latest deployment that was causing duplicate requests. We've rolled back the change. Should we expect the rate limiting to reset automatically?"
			},
			{
				type: "staff",
				content:
					"Yes, the rate limits reset hourly. You should see normal service resume within the next hour. I'd recommend implementing retry logic with exponential backoff in your API calls to handle rate limits gracefully in the future. Would you like me to share some code examples?"
			}
		]
	},
	{
		subject: "Need help with bulk data export",
		messages: [
			{
				type: "widget",
				content:
					"Hi, I need to export all our customer data from the past year. Is there a way to do this in bulk?"
			},
			{
				type: "staff",
				content:
					"I can help you with that! You can use our bulk export feature under Settings > Data > Export. Would you like me to walk you through the process?"
			},
			{
				type: "widget",
				content:
					"Yes please. Also, what format will the export be in? We need it in CSV for our analysis."
			},
			{
				type: "staff",
				content:
					"The data can be exported in CSV, JSON, or Excel format. For CSV exports, go to the export page, select 'CSV' from the format dropdown, choose your date range, and select the fields you want to include. The export will be emailed to you when it's ready."
			}
		]
	},
	{
		subject: "Website extremely slow",
		messages: [
			{
				type: "email",
				content:
					"Your website is practically unusable right now. Pages are taking 30+ seconds to load, if they load at all. This is severely impacting our business operations."
			},
			{
				type: "staff",
				content:
					"I apologize for the performance issues you're experiencing. We're currently investigating reports of slowdown in your region. Could you tell me which specific pages are most affected and your approximate location?"
			},
			{
				type: "email",
				content:
					"We're in Singapore. The dashboard and reporting pages are the worst affected. Even simple actions like viewing a customer profile are timing out."
			},
			{
				type: "staff",
				content:
					"Thank you for the details. We've identified an issue with our Asia-Pacific CDN provider and our team is working on it. I've escalated your case and we'll have this resolved within the hour. In the meantime, you can try using our backup domain at backup.example.com which should be more responsive."
			}
		]
	},
	{
		subject: "Billing cycle confusion",
		messages: [
			{
				type: "email",
				content:
					"We were just charged for our subscription but I thought we had cancelled it last month. Can you explain why we're still being billed?"
			},
			{
				type: "staff",
				content:
					"I'll look into this for you right away. Could you provide your account email or subscription ID?"
			},
			{
				type: "email",
				content:
					"Our account email is company@example.com. We definitely clicked cancel on March 15th."
			},
			{
				type: "staff",
				content:
					"I've checked your account history. While you did start the cancellation process on March 15th, it wasn't completed - the final confirmation step was missing. However, given the confusion, I've gone ahead and processed a refund for this charge. You should see it in 3-5 business days. I've also cancelled the subscription properly now."
			}
		]
	},
	{
		subject: "Feature request - Dark mode",
		messages: [
			{
				type: "widget",
				content:
					"Would love to see a dark mode option in the dashboard. Any plans to add this? Our team works late and the bright interface can be straining."
			},
			{
				type: "staff",
				content:
					"Thanks for the suggestion! We've actually heard this from several users. Dark mode is on our roadmap for Q3. Would you be interested in joining our beta testing group when it's ready?"
			},
			{
				type: "widget",
				content:
					"Definitely! That would be great. Will it include the ability to schedule dark mode based on time of day?"
			},
			{
				type: "staff",
				content:
					"That's a great suggestion! I'll add it to our feature requirements. I've added you to our beta testing list - we'll reach out when it's ready for testing, likely in about 2 months."
			}
		]
	},
	{
		subject: "Integration with Salesforce not working",
		messages: [
			{
				type: "email",
				content:
					"The Salesforce integration stopped syncing data yesterday. We've checked our Salesforce credentials and they're correct. Need this fixed ASAP as it's affecting our sales team."
			},
			{
				type: "staff",
				content:
					"I understand the urgency. Let me check the integration logs for your account. Have you made any recent changes to your Salesforce configuration or API versions?"
			},
			{
				type: "email",
				content:
					"We did upgrade our Salesforce instance to the latest version two days ago. Could that be related?"
			},
			{
				type: "staff",
				content:
					"Yes, that's exactly the issue. The recent Salesforce upgrade requires an update to our integration settings. I can help you update this now. It's a quick fix - we just need to regenerate the API tokens. Would you like me to guide you through the process?"
			}
		]
	},
	{
		subject: "Need higher API rate limits",
		messages: [
			{
				type: "email",
				content:
					"Our business is growing and we're consistently hitting API rate limits. We need these increased. What are our options?"
			},
			{
				type: "staff",
				content:
					"I'd be happy to help you with this. I can see you're on our Professional plan which includes 10,000 requests per hour. Could you share your expected volume so I can recommend the best plan?"
			},
			{
				type: "email",
				content:
					"We're projecting about 25,000 requests per hour in the next month. We'd also need improved support SLAs if possible."
			},
			{
				type: "staff",
				content:
					"Based on your needs, I'd recommend our Enterprise plan. It includes:\n- 50,000 requests per hour\n- 24/7 priority support\n- 99.99% SLA\n- Dedicated account manager\n\nWould you like me to set up a call with our account team to discuss pricing and migration?"
			}
		]
	},
	{
		subject: "Data export timeout",
		messages: [
			{
				type: "widget",
				content:
					"I'm trying to export our transaction data for the past 6 months but the export keeps timing out. The export button just spins and eventually fails."
			},
			{
				type: "staff",
				content:
					"For large exports, we recommend using our async export API. This will process the export in the background and email you when it's ready. Would you like me to show you how to set this up?"
			},
			{
				type: "widget",
				content:
					"That would be helpful. Is there any way to split the export into smaller chunks? We mainly need the last 3 months urgently."
			},
			{
				type: "staff",
				content:
					"Absolutely! You can use the date range filter to break it up. I'll start an export for the last 3 months right now for you. For the remaining data, I'll show you how to use our API endpoint /v1/exports/async which handles large exports more efficiently."
			}
		]
	},
	{
		subject: "Dashboard loading forever",
		messages: [
			{
				type: "email",
				content:
					"The main dashboard has been stuck loading for the past hour. Tried refreshing and clearing cache but nothing helps. Chrome and Firefox both have the same issue."
			},
			{
				type: "staff",
				content:
					"Thanks for reporting this. We're seeing similar reports from other users. Our monitoring shows increased latency in our analytics service. The team is investigating now. Are you able to access any other parts of the application?"
			},
			{
				type: "email",
				content:
					"Other pages seem to work, just very slowly. The reports page eventually loads but takes about 2 minutes."
			},
			{
				type: "staff",
				content:
					"We've identified the root cause - one of our analytics processing nodes is having issues. We're failing over to our backup system now. You should see performance improve within the next 10 minutes. I'll keep this ticket open and confirm with you once it's resolved."
			}
		]
	},
	{
		subject: "Mobile app crashing on startup",
		messages: [
			{
				type: "widget",
				content:
					"The mobile app keeps crashing immediately after opening. I've tried reinstalling but no luck. iPhone 14 Pro, latest iOS."
			},
			{
				type: "staff",
				content:
					"I'm sorry to hear about the crashes. Could you tell me which version of our app you're using? Also, have you tried clearing the app cache?"
			},
			{
				type: "widget",
				content:
					"I'm on version 2.4.3. Just tried clearing cache and data, still crashes."
			},
			{
				type: "staff",
				content:
					"We've identified a critical bug in 2.4.3 affecting iOS 17 users. We've just released version 2.4.4 that fixes this. Could you please update and let me know if that resolves the issue?"
			}
		]
	},
	{
		subject: "Need to update company billing address",
		messages: [
			{
				type: "email",
				content:
					"We've moved offices and need to update our billing address for tax purposes. Where can I do this?"
			},
			{
				type: "staff",
				content:
					"I can help you update your billing address. For security purposes, could you please confirm you're authorized to make billing changes for the account?"
			},
			{
				type: "email",
				content:
					"Yes, I'm the account admin. Here's our new address: 123 Tech Street, Suite 400, San Francisco, CA 94105"
			},
			{
				type: "staff",
				content:
					"I've updated your billing address. You'll see this reflected on your next invoice. I've also sent a confirmation email with the details. Is there anything else you need help with?"
			}
		]
	},
	{
		subject: "API Documentation Unclear",
		messages: [
			{
				type: "widget",
				content:
					"The documentation for the /users/batch endpoint is confusing. It doesn't specify the maximum batch size or rate limits."
			},
			{
				type: "staff",
				content:
					"Thank you for bringing this to our attention. The current batch size limit is 1000 users per request, with a rate limit of 5 requests per minute. I'll update the documentation to clarify this."
			},
			{
				type: "widget",
				content:
					"Thanks for clarifying. One more question - does this endpoint support partial success responses?"
			},
			{
				type: "staff",
				content:
					"Yes, the endpoint returns a response with successful and failed items separately. I'll add an example response to the docs showing this. Would you like me to share an example here as well?"
			}
		]
	},
	{
		subject: "SSO Integration Issues",
		messages: [
			{
				type: "email",
				content:
					"We're trying to set up SSO with Okta but getting a 'Configuration mismatch' error. Our IT team has been stuck on this for hours."
			},
			{
				type: "staff",
				content:
					"I can help with the Okta SSO setup. Could you share your SSO configuration settings (excluding any sensitive data) and the full error message you're seeing?"
			},
			{
				type: "email",
				content:
					"Error is: 'SAML Response does not match SP configuration'. We've double-checked the Entity ID and ACS URL."
			},
			{
				type: "staff",
				content:
					"This usually happens when the Name ID format doesn't match. In Okta, please set the Name ID format to 'EmailAddress' and ensure 'email' is included in the SAML attributes. Let me know if you need a step-by-step guide."
			}
		]
	},
	{
		subject: "Custom Report Generation Failed",
		messages: [
			{
				type: "widget",
				content:
					"Trying to generate a custom report with 12 months of data but it keeps failing with a timeout error."
			},
			{
				type: "staff",
				content:
					"For reports spanning more than 6 months, we recommend using our batch processing API. Would you like me to show you how to set this up?"
			},
			{
				type: "widget",
				content:
					"Yes please. We need this report for our quarterly review tomorrow."
			},
			{
				type: "staff",
				content:
					"I'll help you get this right away. You can use our /v2/reports/async endpoint - I'll start the report generation now and it will email you when complete. For future reference, here's how to do it via the API..."
			}
		]
	},
	{
		subject: "Account Security Alert",
		messages: [
			{
				type: "email",
				content:
					"We received multiple security alerts about login attempts from unusual locations. Need to understand what's happening."
			},
			{
				type: "staff",
				content:
					"I see the alerts - there were 15 failed login attempts from various IPs in the last hour. I've temporarily blocked those IPs. Have any of your team members recently traveled?"
			},
			{
				type: "email",
				content:
					"No travel, but we did recently share access with a new contractor. Could that be related?"
			},
			{
				type: "staff",
				content:
					"Yes, that's likely the cause. I recommend setting up IP whitelisting for your account and creating a separate contractor access level. I can help you configure both now."
			}
		]
	},
	{
		subject: "Data Migration Support",
		messages: [
			{
				type: "widget",
				content:
					"Planning to migrate 500GB of historical data to your platform. Need guidance on best practices and potential downtime."
			},
			{
				type: "staff",
				content:
					"I'll help you plan this migration. What's your current data format and do you have any specific downtime constraints?"
			},
			{
				type: "widget",
				content:
					"Data is in PostgreSQL. We can handle up to 4 hours of downtime but prefer less. Main concern is maintaining data integrity."
			},
			{
				type: "staff",
				content:
					"For that volume, I recommend our staged migration approach: 1) Initial sync while system remains live 2) Delta sync for recent changes 3) Final cutover requiring only 15-30 minutes downtime. Would you like to schedule a technical planning call?"
			}
		]
	},
	{
		subject: "Webhook Delivery Delays",
		messages: [
			{
				type: "email",
				content:
					"Webhooks are being delivered with 5-10 minute delays. This is causing issues with our real-time integrations."
			},
			{
				type: "staff",
				content:
					"I'm checking our webhook delivery logs for your account. I can see increased latency in the EU region. Are you using our new or legacy webhook system?"
			},
			{
				type: "email",
				content: "We're on the legacy system. Didn't know there was a new one."
			},
			{
				type: "staff",
				content:
					"The new webhook system offers much better performance with typical latency under 500ms. I can help you migrate - it's a simple process requiring only an endpoint update and new auth token."
			}
		]
	},
	{
		subject: "GDPR Data Request",
		messages: [
			{
				type: "email",
				content:
					"We need to process a GDPR data deletion request for one of our users. What's the procedure?"
			},
			{
				type: "staff",
				content:
					"I can help with the GDPR request. Please provide the user's email address and confirm you have their consent for deletion."
			},
			{
				type: "email",
				content:
					"Email is user@example.com. Yes, we have written consent. How long will the process take?"
			},
			{
				type: "staff",
				content:
					"I've initiated the deletion process. It typically takes 72 hours to complete across all systems. I'll send you a confirmation once it's done. Note that some data may be retained in encrypted backups for up to 30 days."
			}
		]
	},
	{
		subject: "Custom Domain Setup",
		messages: [
			{
				type: "widget",
				content:
					"Need help setting up a custom domain for our dashboard. We want to use dashboard.ourcompany.com"
			},
			{
				type: "staff",
				content:
					"I'll guide you through the custom domain setup. First, you'll need to add a CNAME record pointing to our servers. Would you like the specific DNS settings?"
			},
			{
				type: "widget",
				content: "Yes please. Also, do we need to update our SSL certificates?"
			},
			{
				type: "staff",
				content:
					"We'll handle the SSL certificate automatically through Let's Encrypt. Here are the DNS settings: CNAME dashboard.ourcompany.com -> custom.example.com. After you add this, it typically takes 24-48 hours to fully propagate."
			}
		]
	},
	{
		subject: "API Rate Limit Increase Request",
		messages: [
			{
				type: "email",
				content:
					"Our team needs increased API rate limits for our production environment. Current limits are too restrictive."
			},
			{
				type: "staff",
				content:
					"I understand you need higher limits. Could you share your current usage patterns and what limits you're hitting specifically?"
			},
			{
				type: "email",
				content:
					"We're consistently hitting the 1000 requests/minute limit during peak hours. Need at least double that."
			},
			{
				type: "staff",
				content:
					"I've reviewed your usage patterns and account standing. I can approve an increase to 2500 requests/minute. I'll implement this change now and monitor for any issues."
			}
		]
	},
	{
		subject: "Password Reset Not Working",
		messages: [
			{
				type: "widget",
				content:
					"The password reset link I received isn't working. Gets an 'expired token' error."
			},
			{
				type: "staff",
				content:
					"Reset links expire after 1 hour for security. When did you request this reset? I can send a new one right away."
			},
			{
				type: "widget",
				content: "Ah, I requested it yesterday. Yes, please send a new one."
			},
			{
				type: "staff",
				content:
					"I've sent a new reset link to your email. This one will be valid for the next hour. Let me know if you don't receive it within 5 minutes."
			}
		]
	},
	{
		subject: "Missing Invoice PDF",
		messages: [
			{
				type: "email",
				content:
					"Can't find the PDF for invoice #INV-2023-12345. Need this for our accounting department."
			},
			{
				type: "staff",
				content:
					"I'll help you locate that invoice. I can see it in our system. Would you like me to resend it to your email?"
			},
			{
				type: "email",
				content:
					"Yes please. Could you also explain why it wasn't automatically sent?"
			},
			{
				type: "staff",
				content:
					"I've resent the invoice. I see there was a temporary issue with our PDF generation service when this invoice was created. I've also enabled automatic PDF generation for all future invoices on your account."
			}
		]
	},
	{
		subject: "Team Member Access Issues",
		messages: [
			{
				type: "widget",
				content:
					"New team member can't access certain dashboard features despite having admin role."
			},
			{
				type: "staff",
				content:
					"Let me check the permissions for this user. Could you provide their email address?"
			},
			{
				type: "widget",
				content: "It's newadmin@company.com. They should have full access."
			},
			{
				type: "staff",
				content:
					"I found the issue - there was a cache problem with the role assignment. I've cleared it and their permissions are now properly applied. They should have full access after logging out and back in."
			}
		]
	},
	{
		subject: "Data Visualization Bug",
		messages: [
			{
				type: "email",
				content:
					"Charts on the analytics dashboard are showing incorrect data. Numbers don't match our raw data."
			},
			{
				type: "staff",
				content:
					"I'll investigate this discrepancy. Could you share a specific example of the mismatch you're seeing?"
			},
			{
				type: "email",
				content:
					"The daily active users chart shows 5000 but our raw data shows 7500 for last week."
			},
			{
				type: "staff",
				content:
					"I've identified the issue - the chart was using cached data. I've cleared the cache and reindexed your analytics. The numbers should now match your raw data. I've also added monitoring to prevent this from happening again."
			}
		]
	},
	{
		subject: "API Documentation Update Request",
		messages: [
			{
				type: "widget",
				content:
					"The documentation for the new batch processing endpoint is missing response examples."
			},
			{
				type: "staff",
				content:
					"Thank you for bringing this to our attention. I'll add comprehensive examples right away. Any specific scenarios you'd like to see covered?"
			},
			{
				type: "widget",
				content:
					"Would be helpful to see examples for both successful and error responses."
			},
			{
				type: "staff",
				content:
					"I've updated the documentation with examples for successful operations, partial successes, and various error scenarios. You can find them at docs/api/batch-processing. Let me know if you need any clarification."
			}
		]
	},
	{
		subject: "Custom Integration Help",
		messages: [
			{
				type: "email",
				content:
					"Need help integrating your API with our custom CRM system. Getting authentication errors."
			},
			{
				type: "staff",
				content:
					"I can help with the integration. First, could you confirm which authentication method you're using - OAuth2 or API keys?"
			},
			{
				type: "email",
				content:
					"We're trying to use OAuth2 but getting 'invalid_grant' errors."
			},
			{
				type: "staff",
				content:
					"I see the issue - your OAuth redirect URI doesn't match what's registered. I'll update it to match 'https://crm.yourcompany.com/callback'. Please also ensure you're using the correct scope 'read:customers write:orders'."
			}
		]
	},
	{
		subject: "Webhook Configuration Help",
		messages: [
			{
				type: "widget",
				content:
					"Need to set up webhooks for order events but unsure about the payload format."
			},
			{
				type: "staff",
				content:
					"I'll help you with the webhook setup. We support JSON payloads with detailed event information. Would you like to see an example payload?"
			},
			{
				type: "widget",
				content:
					"Yes, that would be helpful. Also, do you support retry logic if our endpoint is down?"
			},
			{
				type: "staff",
				content:
					"Yes, we retry failed deliveries with exponential backoff for up to 24 hours. Here's an example payload: {event: 'order.created', data: {...}}. I'll also enable webhook logs for your account so you can debug deliveries."
			}
		]
	},
	{
		subject: "Account Merging Request",
		messages: [
			{
				type: "email",
				content:
					"We have two accounts that need to be merged after a company acquisition. Is this possible?"
			},
			{
				type: "staff",
				content:
					"Yes, we can help with account merging. This requires careful planning to prevent data loss. Could you provide both account IDs?"
			},
			{
				type: "email",
				content:
					"Source account: ACC-123-456, Target account: ACC-789-012. We want to keep the target account's settings."
			},
			{
				type: "staff",
				content:
					"I've started the merge process. Here's what will happen: 1) All users will be migrated 2) Data will be transferred 3) Settings will be preserved from ACC-789-012. This will take about 2 hours. I'll notify you at each step."
			}
		]
	},
	{
		subject: "Report Export Format",
		messages: [
			{
				type: "widget",
				content:
					"Need to change the default export format for all reports from CSV to Excel."
			},
			{
				type: "staff",
				content:
					"I can help you update your export preferences. This can be set account-wide or per user. Which would you prefer?"
			},
			{
				type: "widget",
				content: "Please set it account-wide for consistency."
			},
			{
				type: "staff",
				content:
					"I've updated your account settings to use Excel (.xlsx) as the default export format for all reports. This will apply to all new exports. Would you like me to show you how to override this per report if needed?"
			}
		]
	},
	{
		subject: "API Version Migration",
		messages: [
			{
				type: "email",
				content:
					"Need to migrate from API v1 to v2. What's the recommended approach?"
			},
			{
				type: "staff",
				content:
					"I'll help you plan the migration. V2 has some breaking changes but offers better performance. Would you like a detailed comparison of the changes?"
			},
			{
				type: "email",
				content: "Yes please. Also, how long can we continue using v1?"
			},
			{
				type: "staff",
				content:
					"V1 will be supported for another 6 months. I've prepared a migration guide highlighting the key changes and new features. Would you like to schedule a technical consultation to discuss your specific implementation?"
			}
		]
	},
	{
		subject: "Custom Workflow Setup",
		messages: [
			{
				type: "widget",
				content:
					"Looking to set up automated workflows for ticket routing based on custom rules."
			},
			{
				type: "staff",
				content:
					"I can help you configure custom workflows. What are the main criteria you'd like to use for routing?"
			},
			{
				type: "widget",
				content: "Want to route based on ticket priority and customer segment."
			},
			{
				type: "staff",
				content:
					"I'll help you set up conditional routing rules. We can use the priority field and customer metadata to create routing logic. I'll start by creating a basic workflow and then we can refine it based on your specific needs."
			}
		]
	},
	{
		subject: "Database Backup Configuration",
		messages: [
			{
				type: "email",
				content:
					"Need to set up automated database backups for our self-hosted instance."
			},
			{
				type: "staff",
				content:
					"I'll help you configure automated backups. What's your preferred backup frequency and retention period?"
			},
			{
				type: "email",
				content:
					"We need daily backups with 30-day retention. Can we encrypt the backups?"
			},
			{
				type: "staff",
				content:
					"Yes, we support encrypted backups. I'll help you set up daily backups with AES-256 encryption, 30-day retention, and automatic integrity checks. Would you like the backups stored in your own S3 bucket?"
			}
		]
	},
	{
		subject: "Custom Report Builder",
		messages: [
			{
				type: "widget",
				content:
					"Having trouble creating a custom report with multiple data sources."
			},
			{
				type: "staff",
				content:
					"I can help with the custom report. Which data sources are you trying to combine?"
			},
			{
				type: "widget",
				content: "Need to merge user activity data with billing information."
			},
			{
				type: "staff",
				content:
					"I'll show you how to use our data join feature. You can link these using the customer ID field. I'll create a template report for you that you can customize further."
			}
		]
	},
	{
		subject: "API Authentication Issues",
		messages: [
			{
				type: "email",
				content:
					"Getting 'Invalid Authentication' errors suddenly on all API calls."
			},
			{
				type: "staff",
				content:
					"Let me check your API key status. When did these errors start occurring?"
			},
			{
				type: "email",
				content: "Started about an hour ago. No changes on our end."
			},
			{
				type: "staff",
				content:
					"I see the issue - your API key was automatically rotated due to our security policy. I've generated a new key and temporarily extended the old key's validity for 24 hours to help you transition."
			}
		]
	},
	{
		subject: "User Role Management",
		messages: [
			{
				type: "widget",
				content: "Need to create a custom role with specific permissions."
			},
			{
				type: "staff",
				content:
					"I can help you set up a custom role. What permissions do you need to include?"
			},
			{
				type: "widget",
				content: "Need read access to reports but no write access to any data."
			},
			{
				type: "staff",
				content:
					"I've created a new 'Report Viewer' role with read-only access to reports and dashboards. I can add additional read-only permissions if needed. Would you like me to show you how to assign this role to users?"
			}
		]
	},
	{
		subject: "Data Import Validation",
		messages: [
			{
				type: "email",
				content:
					"Bulk import failed with validation errors. Need help understanding the error messages."
			},
			{
				type: "staff",
				content:
					"I'll help you resolve the validation issues. Could you share the error log or specific error messages you're seeing?"
			},
			{
				type: "email",
				content:
					"Getting 'Invalid format' errors for the date fields in our CSV."
			},
			{
				type: "staff",
				content:
					"I see the issue - your dates are in DD/MM/YYYY format but we expect YYYY-MM-DD. I'll send you a script to convert the dates in your CSV, and update our documentation to clarify the required format."
			}
		]
	},
	{
		subject: "Custom Domain SSL Issue",
		messages: [
			{
				type: "widget",
				content: "Getting SSL certificate errors on our custom domain setup."
			},
			{
				type: "staff",
				content:
					"I'll check your SSL configuration. When was the custom domain added?"
			},
			{
				type: "widget",
				content:
					"Added it yesterday, DNS seems to be propagated but getting certificate warnings."
			},
			{
				type: "staff",
				content:
					"I see the issue - the SSL certificate generation was delayed. I've manually triggered it now. The certificate should be active within 15 minutes. I'll monitor it and confirm once it's properly installed."
			}
		]
	},
	{
		subject: "Webhook Delivery Failures",
		messages: [
			{
				type: "email",
				content:
					"Webhooks stopped delivering to our endpoint. No error notifications received."
			},
			{
				type: "staff",
				content:
					"I'll check the webhook delivery logs. Have you made any recent changes to your endpoint?"
			},
			{
				type: "email",
				content:
					"We updated our SSL certificate yesterday. Could that be related?"
			},
			{
				type: "staff",
				content:
					"Yes, that's the issue. Your new SSL certificate is self-signed. I'll enable SSL verification bypass for your endpoint temporarily. Please install a valid certificate within 48 hours to maintain security."
			}
		]
	},
	{
		subject: "Report Scheduling Error",
		messages: [
			{
				type: "widget",
				content: "Scheduled reports not being delivered to team members."
			},
			{
				type: "staff",
				content:
					"I'll investigate the scheduling system. Which report schedule is affected?"
			},
			{
				type: "widget",
				content: "The daily sales summary scheduled for 8 AM UTC."
			},
			{
				type: "staff",
				content:
					"I found the issue - the report scheduler was stuck due to a timezone configuration error. I've fixed it and manually triggered the missed reports. They should arrive within 10 minutes."
			}
		]
	},
	{
		subject: "API Response Time Issues",
		messages: [
			{
				type: "email",
				content:
					"API responses are much slower than usual. Average response time increased by 300%."
			},
			{
				type: "staff",
				content:
					"I'll check our API performance metrics. Which endpoints are most affected?"
			},
			{
				type: "email",
				content: "The /users/search and /orders/list endpoints are the slowest."
			},
			{
				type: "staff",
				content:
					"I've identified the cause - a database index was missing after recent maintenance. I've added the index and response times should return to normal within 5 minutes. I'm also adding monitoring alerts to prevent this in the future."
			}
		]
	},
	{
		subject: "Integration Timeout Issues",
		messages: [
			{
				type: "widget",
				content: "Our Salesforce integration keeps timing out during data sync."
			},
			{
				type: "staff",
				content:
					"I'll look into the timeout issues. How much data are you typically syncing?"
			},
			{
				type: "widget",
				content: "About 50,000 records per sync, takes over 5 minutes."
			},
			{
				type: "staff",
				content:
					"I'll increase the timeout limit and implement batch processing. This will break the sync into smaller chunks of 5,000 records each. I'll also add a progress indicator so you can monitor the sync status."
			}
		]
	},
	{
		subject: "Custom Field Configuration",
		messages: [
			{
				type: "email",
				content:
					"Need to add custom fields to our customer profiles but getting validation errors."
			},
			{
				type: "staff",
				content:
					"I can help with custom field setup. What type of fields are you trying to add?"
			},
			{
				type: "email",
				content:
					"Need to add a dropdown for industry and a date field for contract renewal."
			},
			{
				type: "staff",
				content:
					"I'll help you set these up. I've created the industry dropdown with standard categories (you can customize these) and added the contract renewal date field with proper validation. Would you like me to help migrate existing data to these new fields?"
			}
		]
	},
	{
		subject: "Audit Log Access",
		messages: [
			{
				type: "widget",
				content: "Need access to detailed audit logs for compliance review."
			},
			{
				type: "staff",
				content:
					"I can help you access the audit logs. What time period do you need to review?"
			},
			{
				type: "widget",
				content:
					"Need the last 90 days of user access and data modification logs."
			},
			{
				type: "staff",
				content:
					"I've granted you access to the audit log dashboard and exported the last 90 days of logs in CSV format. The logs include timestamps, user IDs, actions taken, and IP addresses. Would you like me to set up automated monthly exports?"
			}
		]
	},
	{
		subject: "Mobile App Push Notifications",
		messages: [
			{
				type: "email",
				content:
					"Push notifications not working on our iOS app after the latest update."
			},
			{
				type: "staff",
				content:
					"I'll check the push notification service. Are you receiving any error messages on the device?"
			},
			{
				type: "email",
				content:
					"No error messages, notifications just aren't coming through at all."
			},
			{
				type: "staff",
				content:
					"I found the issue - the iOS push certificate expired yesterday. I've renewed it and notifications should start working again within 15 minutes. I'm also setting up automatic renewal notifications to prevent this in the future."
			}
		]
	},
	{
		subject: "Data Retention Policy",
		messages: [
			{
				type: "widget",
				content:
					"Need to implement a custom data retention policy for compliance reasons."
			},
			{
				type: "staff",
				content:
					"I can help set up data retention rules. What are your requirements for data retention periods?"
			},
			{
				type: "widget",
				content:
					"Need to keep user data for 2 years, and transaction data for 7 years."
			},
			{
				type: "staff",
				content:
					"I'll configure the retention policy with those timeframes. I'll also set up monthly reports of what data is scheduled for deletion, and add a 30-day grace period before permanent deletion. Would you like to review the first deletion report?"
			}
		]
	},
	{
		subject: "API Rate Limiting Strategy",
		messages: [
			{
				type: "email",
				content:
					"Need help implementing a better rate limiting strategy for our API usage."
			},
			{
				type: "staff",
				content:
					"I can help optimize your rate limiting. What's your current usage pattern and what issues are you experiencing?"
			},
			{
				type: "email",
				content:
					"We have burst periods where we need higher limits, but normal usage is low."
			},
			{
				type: "staff",
				content:
					"I'll set up dynamic rate limiting with burst allowance. You'll get 5x your normal limit for up to 5 minutes per hour. I'll also add rate limit headers to responses so you can monitor usage."
			}
		]
	},
	{
		subject: "Custom Analytics Dashboard",
		messages: [
			{
				type: "widget",
				content:
					"Need help creating a custom analytics dashboard for executive reporting."
			},
			{
				type: "staff",
				content:
					"I can help you build a custom dashboard. What key metrics do you need to display?"
			},
			{
				type: "widget",
				content: "Need MRR growth, customer churn, and feature adoption rates."
			},
			{
				type: "staff",
				content:
					"I've created a template dashboard with those metrics. I've also added trend lines and month-over-month comparisons. Would you like me to add automated weekly email reports of this dashboard?"
			}
		]
	},
	{
		subject: "Third-party Integration Security",
		messages: [
			{
				type: "email",
				content:
					"Concerned about security of our Salesforce integration. Need security audit."
			},
			{
				type: "staff",
				content:
					"I'll help review the integration security. When was the last security assessment done?"
			},
			{
				type: "email",
				content:
					"Never had a formal assessment. Using default configuration from 6 months ago."
			},
			{
				type: "staff",
				content:
					"I'll run a security audit now. I've already noticed we should enable IP whitelisting and upgrade to certificate-based authentication. I'll prepare a complete security enhancement plan for your review."
			}
		]
	},
	{
		subject: "Bulk User Import",
		messages: [
			{
				type: "widget",
				content: "Need to bulk import 1000+ users from our old system."
			},
			{
				type: "staff",
				content:
					"I can help with the bulk import. Do you have the user data in CSV format?"
			},
			{
				type: "widget",
				content: "Yes, but some fields don't match your system's format."
			},
			{
				type: "staff",
				content:
					"I'll provide a field mapping template and validation script. This will help you prepare the data correctly. Would you like to do a test import with a small subset first?"
			}
		]
	},
	{
		subject: "Custom Email Templates",
		messages: [
			{
				type: "email",
				content: "Need to create custom email templates with dynamic content."
			},
			{
				type: "staff",
				content:
					"I can help you set up dynamic email templates. What kind of personalization do you need?"
			},
			{
				type: "email",
				content: "Want to include user's usage stats and upcoming renewal date."
			},
			{
				type: "staff",
				content:
					"I'll help you create templates with those dynamic fields. I'll also show you how to test templates with sample data and set up template versioning for A/B testing."
			}
		]
	},
	{
		subject: "API Webhook Setup",
		messages: [
			{
				type: "widget",
				content:
					"Need help setting up webhooks for real-time order notifications."
			},
			{
				type: "staff",
				content:
					"I can help configure webhooks. What events do you want to be notified about?"
			},
			{
				type: "widget",
				content:
					"Need notifications for new orders, cancellations, and refunds."
			},
			{
				type: "staff",
				content:
					"I'll set up webhooks for those events. I'm also adding retry logic with exponential backoff, and a webhook monitoring dashboard so you can track delivery success rates."
			}
		]
	},
	{
		subject: "Data Export Automation",
		messages: [
			{
				type: "email",
				content: "Need to automate weekly data exports to our data warehouse."
			},
			{
				type: "staff",
				content:
					"I can help set up automated exports. Which data do you need to export and what's your preferred format?"
			},
			{
				type: "email",
				content:
					"Need customer and transaction data in JSON format, delivered to our S3 bucket."
			},
			{
				type: "staff",
				content:
					"I'll set up weekly automated exports to your S3 bucket. I'll also add checksums for data integrity and notification alerts if any export fails."
			}
		]
	},
	{
		subject: "Custom Integration Development",
		messages: [
			{
				type: "widget",
				content:
					"Need help developing a custom integration with our internal tools."
			},
			{
				type: "staff",
				content:
					"I can guide you through the integration development. What's the primary goal of this integration?"
			},
			{
				type: "widget",
				content: "Need to sync customer data between systems in real-time."
			},
			{
				type: "staff",
				content:
					"I'll help you implement this using our real-time sync API. I'll provide code examples in Python and Node.js, and help you set up error handling and monitoring."
			}
		]
	},
	{
		subject: "Performance Optimization",
		messages: [
			{
				type: "email",
				content:
					"Dashboard loading times are slow for users with large datasets."
			},
			{
				type: "staff",
				content:
					"I'll help optimize the dashboard performance. How many records are typically being loaded?"
			},
			{
				type: "email",
				content:
					"Some users have 100,000+ records, dashboard takes 30+ seconds to load."
			},
			{
				type: "staff",
				content:
					"I'll implement pagination and lazy loading for the dashboard. I'm also adding data caching and optimizing the database queries. This should reduce load times to under 3 seconds."
			}
		]
	},
	{
		subject: "Multi-factor Authentication Setup",
		messages: [
			{
				type: "widget",
				content:
					"Need to enable multi-factor authentication for all team members."
			},
			{
				type: "staff",
				content:
					"I can help set up MFA. Would you prefer SMS-based or authenticator app-based MFA?"
			},
			{
				type: "widget",
				content:
					"Authenticator app would be more secure. Can we enforce this for all users?"
			},
			{
				type: "staff",
				content:
					"Yes, I'll enable mandatory authenticator-based MFA. I'll also set up a 14-day grace period for existing users to configure it, and provide step-by-step setup guides."
			}
		]
	},
	{
		subject: "API Documentation Feedback",
		messages: [
			{
				type: "email",
				content:
					"Found some inconsistencies in the API documentation for the new endpoints."
			},
			{
				type: "staff",
				content:
					"Thank you for reporting this. Could you point out which endpoints have inconsistent documentation?"
			},
			{
				type: "email",
				content:
					"The /users/batch and /users/search endpoints show different response formats."
			},
			{
				type: "staff",
				content:
					"You're right - I've updated the documentation to use consistent response formats. I've also added more examples and clarified the pagination parameters."
			}
		]
	},
	{
		subject: "Custom Report Scheduling",
		messages: [
			{
				type: "widget",
				content:
					"Need to schedule custom reports to be sent to different teams."
			},
			{
				type: "staff",
				content:
					"I can help set up scheduled reports. What's the frequency and distribution list for each report?"
			},
			{
				type: "widget",
				content:
					"Daily reports for sales team, weekly for management, monthly for finance."
			},
			{
				type: "staff",
				content:
					"I've set up three report schedules with different frequencies and recipients. I've also added report preview options and the ability to manually trigger reports if needed."
			}
		]
	},
	{
		subject: "Data Migration Status",
		messages: [
			{
				type: "email",
				content:
					"Need an update on our data migration progress. Started yesterday."
			},
			{
				type: "staff",
				content:
					"I'll check the migration status. The process was scheduled for 48 hours. Let me get you the current progress."
			},
			{
				type: "email",
				content: "Are we still on schedule? Any issues encountered?"
			},
			{
				type: "staff",
				content:
					"Migration is 65% complete and on schedule. No errors so far. I've set up a real-time progress dashboard you can monitor. Estimated completion in 14 hours."
			}
		]
	},
	{
		subject: "API Version Deprecation",
		messages: [
			{
				type: "widget",
				content:
					"Received deprecation notice for API v1. Need help planning upgrade."
			},
			{
				type: "staff",
				content:
					"I'll help you plan the v2 migration. First, let's identify which v1 endpoints you're currently using."
			},
			{
				type: "widget",
				content: "Using user management and reporting endpoints heavily."
			},
			{
				type: "staff",
				content:
					"I've prepared a migration guide specific to those endpoints. V2 has improved performance but requires some parameter changes. Would you like to schedule a technical review call?"
			}
		]
	},
	{
		subject: "Custom Domain Migration",
		messages: [
			{
				type: "email",
				content: "Need to migrate our custom domain to a new DNS provider."
			},
			{
				type: "staff",
				content:
					"I'll help with the domain migration. When would you like to schedule this change?"
			},
			{
				type: "email",
				content: "This weekend would be ideal. Need to minimize disruption."
			},
			{
				type: "staff",
				content:
					"I'll prepare a migration plan for this weekend. We'll need about 1 hour of downtime. I'll provide new DNS settings and help monitor the propagation."
			}
		]
	},
	{
		subject: "Security Audit Results",
		messages: [
			{
				type: "widget",
				content:
					"Requesting results of recent security audit for compliance review."
			},
			{
				type: "staff",
				content:
					"I'll provide the security audit report. Would you like the full technical report or the executive summary?"
			},
			{
				type: "widget",
				content: "Need both versions for different stakeholders."
			},
			{
				type: "staff",
				content:
					"I've shared both reports. The executive summary highlights key findings, while the technical report includes detailed vulnerability assessments and remediation steps."
			}
		]
	},
	{
		subject: "API Usage Optimization",
		messages: [
			{
				type: "email",
				content: "Looking to optimize our API usage to reduce costs."
			},
			{
				type: "staff",
				content:
					"I'll help analyze your API usage patterns. Let me pull your usage data from the last month."
			},
			{
				type: "email",
				content: "We're mainly concerned about redundant calls and caching."
			},
			{
				type: "staff",
				content:
					"I've identified several optimization opportunities: implementing response caching, batching requests, and using webhooks instead of polling. I'll send you a detailed optimization plan."
			}
		]
	},
	{
		subject: "User Permission Templates",
		messages: [
			{
				type: "widget",
				content: "Need to create role templates for different user types."
			},
			{
				type: "staff",
				content:
					"I can help set up role templates. What user types do you need to define?"
			},
			{
				type: "widget",
				content:
					"Need templates for admin, manager, analyst, and read-only users."
			},
			{
				type: "staff",
				content:
					"I've created the role templates with appropriate permissions. I've also added the ability to customize each template and bulk assign roles to users."
			}
		]
	},
	{
		subject: "Data Archival Process",
		messages: [
			{
				type: "email",
				content: "Need to set up automated data archival for old records."
			},
			{
				type: "staff",
				content:
					"I'll help configure data archival. What's your criteria for archiving data?"
			},
			{
				type: "email",
				content:
					"Want to archive records older than 2 years, but keep them accessible."
			},
			{
				type: "staff",
				content:
					"I'll set up automated archival to cold storage for data over 2 years old. You'll still be able to access archived data through the API, just with slightly longer retrieval times."
			}
		]
	},
	{
		subject: "Integration Testing Environment",
		messages: [
			{
				type: "widget",
				content: "Need a separate testing environment for API integration."
			},
			{
				type: "staff",
				content:
					"I'll help set up a testing environment. Do you need it to mirror your production data?"
			},
			{
				type: "widget",
				content: "Yes, but with anonymized customer data for privacy."
			},
			{
				type: "staff",
				content:
					"I'll create a sandbox environment with anonymized production data. I'll also provide separate API keys and documentation for the test environment."
			}
		]
	}
]
