import { NextResponse } from 'next/server';

/**
 * GET /api/auth/saml/metadata
 * Returns SAML Service Provider metadata XML for Stanford IdP registration
 * This endpoint should be accessible to Stanford's IdP for SP registration
 */
export function GET() {
  // Validate required environment variables
  const requiredVars = {
    SAML_ENTITY_ID: process.env.SAML_ENTITY_ID,
    SAML_CALLBACK_URL: process.env.SAML_CALLBACK_URL,
    SAML_PUBLIC_CERT: process.env.SAML_PUBLIC_CERT,
  };

  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    return NextResponse.json(
      {
        error: 'Missing required SAML environment variables',
        missing,
      },
      { status: 500 }
    );
  }

  // Clean the certificate (remove headers and whitespace)
  const cert = requiredVars.SAML_PUBLIC_CERT!
    .replace(/-----BEGIN CERTIFICATE-----/g, '')
    .replace(/-----END CERTIFICATE-----/g, '')
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\s+/g, '');

  // Build SAML 2.0 Service Provider metadata XML
  const metadata = `<?xml version="1.0"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata"
                  xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
                  entityID="${requiredVars.SAML_ENTITY_ID}">
  <SPSSODescriptor
      AuthnRequestsSigned="false"
      WantAssertionsSigned="true"
      protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <KeyDescriptor use="signing">
      <ds:KeyInfo>
        <ds:X509Data>
          <ds:X509Certificate>${cert}</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </KeyDescriptor>
    <AssertionConsumerService
        index="1"
        isDefault="true"
        Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        Location="${requiredVars.SAML_CALLBACK_URL}"/>
  </SPSSODescriptor>
</EntityDescriptor>`;

  return new NextResponse(metadata, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}
