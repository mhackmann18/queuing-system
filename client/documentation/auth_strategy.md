3/12/24
I need an auth strategy. As things stand, there are 3 different levels of auth. There's an admin, which is essentially the company owner, or those authorized by the company owner to carry out admin actions. Admins can perform actions that impact the company's entire system, such as managing offices, managing general user accounts, and being able to delete just about anything related to the company. Therefore, due to their privileges, admins should have a highly secure login process.

Researching...

Multifactor authentication seems like a good candidate for admins. It may be tedious for the user, but in the context of this application admin accounts shouldn't be needed for anything other than high level actions such as creating new users or resetting user passwords, things that shouldn't need to be done very often.

So ideally, the auth provider chosen should have multi factor authentication.

Furthermore, the factors in multifactor need to be determined. The chosen auth provider will likely have its own factors to choose from, but it won't hurt to pick the desired factors now to aid in the decision of picking the auth provider.

Sidenote: I'm going for a multi tenant architecture, meaning the companies using the app will be sharing the same infrastructure.

Researching...

Most of the authentication factors seem inconvenient or expensive. Ultimately, the plan is to have the first factor be a password knowledge factor, and the second factor to be a possession factor, such as providing an auth code through email or text. This seems like the most widely used and acceptable method from the end user's perspective. It also is more secure than simply using two knowledge factors.

So for admins, the auth strat will be passoword and multifactor. Maybe tokens too.

---

Here's a consideration: everntually, all customers joining a waiting list will likely need to create an account to recieve sms alerts and make it more difficult for spam accounts in the check in process. This means costs need to be kept in mind for the very large number of customers served by the offices. For them, you'd likely want to do something super easy, like sso.

Researching auth providers that fit requirements...

X - Clerk: $100 a month for mfa. Way over current budget
X - Keycloak: Too complex, requires too much setup time, I want a more managed solution
X - .NET Identity: Overly complicated documentation
X - SuperTokens: Expensive unless self hosted

SMS PRICING

- Firebase: First 10 free, then $.01 per sms
- Supabase: With Twilio, there's a pay as you go approach, $.0079 per sms
- Auth0: Also supports Twilio

---

I did some research on the benefits and drawback of self hosting an auth provider, vs using their managed cloud solution, and I decided to go with the managed one.
