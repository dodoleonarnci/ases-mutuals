# SAML SSO Configuration Guide

## Accessing SAML Metadata

Your SAML Service Provider metadata is available at:

### Local Development
```
http://localhost:3000/api/auth/saml/metadata
```

### Production
```
https://yourdomain.com/api/auth/saml/metadata
```

## Reading Metadata as XML

### Option 1: Browser
Simply navigate to the metadata URL in your browser. Most browsers will display the XML content directly.

### Option 2: cURL (Command Line)
```bash
# Local development
curl http://localhost:3000/api/auth/saml/metadata

# Save to file
curl http://localhost:3000/api/auth/saml/metadata -o metadata.xml

# Pretty print (requires xmllint)
curl http://localhost:3000/api/auth/saml/metadata | xmllint --format -
```

### Option 3: wget
```bash
wget http://localhost:3000/api/auth/saml/metadata -O metadata.xml
```

### Option 4: Node.js/TypeScript (Programmatic)
```typescript
// Fetch metadata programmatically
const response = await fetch('http://localhost:3000/api/auth/saml/metadata');
const xmlMetadata = await response.text();
console.log(xmlMetadata);

// Or parse as XML
import { DOMParser } from '@xmldom/xmldom';
const parser = new DOMParser();
const xmlDoc = parser.parseFromString(xmlMetadata, 'text/xml');
```

### Option 5: Python
```python
import requests
import xml.etree.ElementTree as ET

# Fetch metadata
response = requests.get('http://localhost:3000/api/auth/saml/metadata')
xml_content = response.text

# Parse and pretty print
root = ET.fromstring(xml_content)
ET.indent(root)  # Pretty print (Python 3.9+)
print(ET.tostring(root, encoding='unicode'))
```

## Required Environment Variables

Before the metadata endpoint works, ensure these environment variables are set in your `.env.local` file:

### Step 1: Create `.env.local` file

Copy the example file and fill in your values:

```bash
cp config/env.example .env.local
```

### Step 2: Add SAML Environment Variables

Edit `.env.local` and add the following SAML variables:

```bash
# Stanford IdP Configuration (from Stanford's documentation)
SAML_ENTRYPOINT="https://idp.stanford.edu/"
SAML_IDP_CERT="-----BEGIN CERTIFICATE-----\n...Stanford's certificate...\n-----END CERTIFICATE-----"

# Your Service Provider Configuration
SAML_ISSUER="https://yourdomain.com/saml"  # Your unique Entity ID
SAML_ENTITY_ID="https://yourdomain.com/saml"  # Same as SAML_ISSUER
SAML_CALLBACK_URL="https://yourdomain.com/api/auth/saml/callback"  # Your callback endpoint
SAML_PUBLIC_CERT="-----BEGIN CERTIFICATE-----\n...Your certificate...\n-----END CERTIFICATE-----"
```

### Where to Get These Values

1. **SAML_ENTRYPOINT**: Usually `https://idp.stanford.edu/` (from Stanford documentation)
2. **SAML_IDP_CERT**: Download from `https://login.stanford.edu/idp.crt`
3. **SAML_ISSUER / SAML_ENTITY_ID**: Choose a unique identifier for your app (usually a URL)
4. **SAML_CALLBACK_URL**: Your production callback URL (e.g., `https://yourdomain.com/api/auth/saml/callback`)
5. **SAML_PUBLIC_CERT**: Your app's public certificate (generated when creating your key pair)

### Certificate Format

Certificates should be in PEM format with newlines escaped as `\n`:

```bash
SAML_PUBLIC_CERT="-----BEGIN CERTIFICATE-----\nMIIFUTCCAzmgAwIBAgIJAKZfQw5K...\n-----END CERTIFICATE-----"
```

Or use multi-line format in `.env.local`:
```bash
SAML_PUBLIC_CERT="-----BEGIN CERTIFICATE-----
MIIFUTCCAzmgAwIBAgIJAKZfQw5K...
-----END CERTIFICATE-----"
```

## Testing the Metadata Endpoint

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test the endpoint:**
   ```bash
   curl http://localhost:3000/api/auth/saml/metadata
   ```

3. **Expected output:** XML metadata similar to:
   ```xml
   <?xml version="1.0"?>
   <EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata"
                     xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
                     entityID="https://your-app.com/saml">
     <SPSSODescriptor ...>
       ...
     </SPSSODescriptor>
   </EntityDescriptor>
   ```

## Validating Metadata XML

You can validate the XML structure:

```bash
# Using xmllint
curl http://localhost:3000/api/auth/saml/metadata | xmllint --noout -

# Using xmlstarlet
curl http://localhost:3000/api/auth/saml/metadata | xmlstarlet val -
```

## For Stanford SSO Registration

When registering with Stanford's Service Provider Database:

1. **Provide the metadata URL:**
   - Development: `http://localhost:3000/api/auth/saml/metadata` (for testing)
   - Production: `https://yourdomain.com/api/auth/saml/metadata`

2. **Or download and upload the XML file:**
   ```bash
   curl https://yourdomain.com/api/auth/saml/metadata -o sp-metadata.xml
   # Then upload sp-metadata.xml to Stanford's SPDB
   ```

## Troubleshooting

If you get a JSON error response instead of XML:
- Check that all required environment variables are set
- Verify the endpoint is accessible (check server logs)
- Ensure you're using GET method (not POST)

If the XML looks incorrect:
- Verify `SAML_PUBLIC_CERT` contains a valid certificate
- Check that `SAML_CALLBACK_URL` matches your actual callback URL
- Ensure `SAML_ENTITY_ID` is a valid URI

