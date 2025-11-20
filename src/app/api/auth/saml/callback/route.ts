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
    entryPoint: requiredEnvVars.SAML_ENTRYPOINT!,
    issuer: requiredEnvVars.SAML_ISSUER!,
    callbackUrl: requiredEnvVars.SAML_CALLBACK_URL!,
    cert: requiredEnvVars.SAML_IDP_CERT!,
    wantAssertionsSigned: true,
    wantAuthnResponseSigned: true,
  };
}

/**
 * POST /api/auth/saml/callback
 * Handles SAML response from Stanford IdP after authentication
 */
export async function POST(req: NextRequest) {
  try {
    const saml = new SAML(getSamlConfig());

    // Get the SAML response from the form data
    const formData = await req.formData();
    const SAMLResponse = formData.get('SAMLResponse') as string | null;
    const RelayState = formData.get('RelayState') as string | null;

    if (!SAMLResponse) {
      return NextResponse.json(
        { error: 'Missing SAMLResponse' },
        { status: 400 }
      );
    }

    // Validate and parse the SAML response
    // validatePostResponseAsync expects an object with SAMLResponse key
    const { profile, loggedOut } = await saml.validatePostResponseAsync({
      SAMLResponse: SAMLResponse,
      RelayState: RelayState || undefined,
    });

    if (loggedOut) {
      return NextResponse.json(
        { error: 'User logged out' },
        { status: 401 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Invalid SAML response' },
        { status: 401 }
      );
    }

    // Extract user information from SAML profile
    // Stanford typically provides:
    // - nameID: SUNetID@stanford.edu (email)
    // - Various attributes in the profile object
    const email = profile.nameID || profile.email || profile['urn:oid:0.9.2342.19200300.100.1.3'];

    if (!email) {
      console.error('SAML profile:', profile);
      return NextResponse.json(
        { error: 'No email found in SAML response' },
        { status: 401 }
      );
    }

    // Ensure email ends with @stanford.edu
    if (!email.toLowerCase().endsWith('@stanford.edu')) {
      return NextResponse.json(
        { error: 'Invalid Stanford email address' },
        { status: 403 }
      );
    }

    // TODO: Here you should:
    // 1. Create or update user session in Supabase/database
    // 2. Set authentication cookies/tokens
    // 3. Redirect to the intended page (from RelayState) or dashboard

    // Parse redirect URL - RelayState should be a relative path or full URL
    // new URL() handles both absolute and relative URLs correctly
    const redirectUrl = new URL(RelayState || '/', req.url).toString();

    // Set a simple success response (you'll want to handle session creation here)
    return NextResponse.redirect(redirectUrl, {
      headers: {
        // TODO: Set authentication cookie/session here
        // Example:
        // 'Set-Cookie': `session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`
      },
    });
  } catch (error) {
    console.error('SAML callback error:', error);
    return NextResponse.json(
      {
        error: 'SAML authentication failed',
        message:
          error instanceof Error ? error.message : 'Failed to process SSO callback',
      },
      { status: 401 }
    );
  }
}
