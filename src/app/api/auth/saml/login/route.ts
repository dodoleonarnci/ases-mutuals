import { NextRequest, NextResponse } from 'next/server';
import { SAML } from '@node-saml/node-saml';

// Initialize SAML Service Provider configuration
function getSamlConfig() {
  const requiredEnvVars = {
    SAML_ENTRYPOINT: process.env.SAML_ENTRYPOINT,
    SAML_ISSUER: process.env.SAML_ISSUER,
    SAML_CALLBACK_URL: process.env.SAML_CALLBACK_URL,
    SAML_IDP_CERT: process.env.SAML_IDP_CERT,
  };

  // Check for missing required environment variables
  const missing = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required SAML environment variables: ${missing.join(', ')}`
    );
  }

  return {
    entryPoint: requiredEnvVars.SAML_ENTRYPOINT!, // Stanford IdP SSO URL
    issuer: requiredEnvVars.SAML_ISSUER!, // Your app's Entity ID
    callbackUrl: requiredEnvVars.SAML_CALLBACK_URL!, // Your callback URL
    cert: requiredEnvVars.SAML_IDP_CERT!, // Stanford's public certificate
    wantAssertionsSigned: true,
    wantAuthnResponseSigned: true,
  };
}

/**
 * GET /api/auth/saml/login
 * Initiates SSO login by redirecting to Stanford's IdP
 */
export async function GET(req: NextRequest) {
  try {
    const saml = new SAML(getSamlConfig());

    // Get the relay state (optional - where to redirect after login)
    const searchParams = req.nextUrl.searchParams;
    const relayState = searchParams.get('RelayState') || '/';

    // Generate the SAML authorization URL with redirect binding
    // Signature: getAuthorizeUrlAsync(RelayState: string, host: string | undefined, options: AuthOptions)
    const loginUrl = await saml.getAuthorizeUrlAsync(relayState, undefined, {});

    // Redirect user to Stanford's IdP for authentication
    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error('SAML login error:', error);
    return NextResponse.json(
      {
        error: 'SAML configuration error',
        message:
          error instanceof Error ? error.message : 'Failed to initiate SSO login',
      },
      { status: 500 }
    );
  }
}
