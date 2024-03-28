using System.Security.Claims;
using System.Text.Encodings.Web;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace CustomerApi.Middleware;

/* This class is responsible for authenticating the user using Firebase.
   It inherits from the AuthenticationHandler class and overrides the HandleAuthenticateAsync method.
   This method is called when the authentication middleware is invoked.
   It extracts the token from the Authorization header and verifies it using the Firebase SDK.
   If the token is valid, it creates a ClaimsIdentity and a ClaimsPrincipal and returns an AuthenticationTicket with the principal.
   If the token is invalid, it returns an AuthenticateResult with a failure message. */
public class FirebaseAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public FirebaseAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder
    )
        : base(options, logger, encoder) { }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.ContainsKey("Authorization"))
            return AuthenticateResult.Fail("Authorization header not found");

        string? authorizationHeader = Request.Headers["Authorization"];
        if (string.IsNullOrEmpty(authorizationHeader))
            return AuthenticateResult.Fail("Invalid authorization header");

        // Auth header is in the format "Bearer ID_TOKEN", so we need the ID_TOKEN part after the space
        string idToken = authorizationHeader.Split(" ").Last();

        try
        {
            FirebaseToken decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(
                idToken
            );
            string uid = decodedToken.Uid;

            var claimsIdentity = new ClaimsIdentity(uid);
            claimsIdentity.AddClaim(new Claim(ClaimTypes.NameIdentifier, uid));
            var principal = new ClaimsPrincipal(claimsIdentity);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);

            return AuthenticateResult.Success(ticket);
        }
        catch (FirebaseAuthException)
        {
            return AuthenticateResult.Fail("Firebase validation failed");
        }
    }
}
