# SAML Environment Variables Setup Guide

## Quick Start

1. **Copy the example environment file:**
   ```bash
   cp config/env.example .env.local
   ```

2. **Edit `.env.local`** and add your SAML configuration values

3. **Restart your development server** (if running):
   ```bash
   npm run dev
   ```

## Required SAML Environment Variables

### Stanford IdP Configuration

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `SAML_ENTRYPOINT` | Stanford IdP SSO login URL | `https://idp.stanford.edu/` |
| `SAML_IDP_CERT` | Stanford's public certificate | Download from `https://login.stanford.edu/idp.crt` |

### Your Service Provider Configuration

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `SAML_ISSUER` | Your app's Entity ID (unique identifier) | `https://yourdomain.com/saml` |
| `SAML_ENTITY_ID` | Same as SAML_ISSUER (used in metadata) | `https://yourdomain.com/saml` |
| `SAML_CALLBACK_URL` | Where Stanford sends SAML responses | `https://yourdomain.com/api/auth/saml/callback` |
| `SAML_PUBLIC_CERT` | Your app's public certificate | Your PEM certificate |

## Detailed Setup

### 1. Get Stanford's Certificate

Download Stanford's public certificate:

```bash
curl https://login.stanford.edu/idp.crt -o stanford-idp.crt
```

Then add it to `.env.local`:

```bash
SAML_IDP_CERT="-----BEGIN CERTIFICATE-----
[contents of stanford-idp.crt]
-----END CERTIFICATE-----"
```

### 2. Generate Your Certificate (if needed)

If you don't have a certificate yet, generate one:

```bash
# Generate private key
openssl genrsa -out saml-private-key.pem 2048

# Generate certificate
openssl req -new -x509 -key saml-private-key.pem -out saml-public-cert.pem -days 365
```

Then add the public certificate to `.env.local`:

```bash
SAML_PUBLIC_CERT="-----BEGIN CERTIFICATE-----
[contents of saml-public-cert.pem]
-----END CERTIFICATE-----"
```

⚠️ **Important**: Keep your private key secure! Don't commit it to git.

### 3. Set Your Entity ID and URLs

Choose a unique Entity ID for your app (usually a URL):

```bash
# For local development
SAML_ISSUER="http://localhost:3000/saml"
SAML_ENTITY_ID="http://localhost:3000/saml"
SAML_CALLBACK_URL="http://localhost:3000/api/auth/saml/callback"

# For production
SAML_ISSUER="https://yourdomain.com/saml"
SAML_ENTITY_ID="https://yourdomain.com/saml"
SAML_CALLBACK_URL="https://yourdomain.com/api/auth/saml/callback"
```

### 4. Complete `.env.local` Example

```bash
# Supabase Configuration
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_ANON_KEY="public-anon-key"
SUPABASE_SERVICE_ROLE_KEY="service-role-key"

NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="public-anon-key"

# Stanford IdP Configuration
SAML_ENTRYPOINT="https://idp.stanford.edu/"
SAML_IDP_CERT="-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKZfQw5K...
-----END CERTIFICATE-----"

# Your Service Provider Configuration
SAML_ISSUER="https://yourdomain.com/saml"
SAML_ENTITY_ID="https://yourdomain.com/saml"
SAML_CALLBACK_URL="https://yourdomain.com/api/auth/saml/callback"
SAML_PUBLIC_CERT="-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKZfQw5K...
-----END CERTIFICATE-----"
```

## Certificate Format Tips

### Option 1: Single Line (with \n)
```bash
SAML_PUBLIC_CERT="-----BEGIN CERTIFICATE-----\nMIIDXTCCAkW...\n-----END CERTIFICATE-----"
```

### Option 2: Multi-line (in .env.local)
```bash
SAML_PUBLIC_CERT="-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKZfQw5K...
[rest of certificate]
-----END CERTIFICATE-----"
```

Both formats work in `.env.local` files.

## Verifying Your Configuration

### 1. Check if variables are set

```bash
# Check if .env.local exists
ls -la .env.local

# View variables (be careful not to expose secrets)
grep SAML .env.local | cut -d'=' -f1
```

### 2. Test the metadata endpoint

Start your server and test:

```bash
npm run dev
# In another terminal:
curl http://localhost:3000/api/auth/saml/metadata
```

If configured correctly, you should see XML metadata. If variables are missing, you'll get a JSON error.

### 3. Validate environment variables in code

The application will check for required variables and show clear error messages if any are missing.

## Production Deployment

### Vercel

1. Go to your project settings → Environment Variables
2. Add each SAML environment variable
3. Redeploy your application

### Other Platforms

Ensure your hosting platform supports environment variables and add all SAML variables there.

## Troubleshooting

### "Missing required SAML environment variables"

- Check that `.env.local` exists and contains all SAML variables
- Verify variable names match exactly (case-sensitive)
- Ensure certificates are properly formatted with BEGIN/END markers
- Restart your development server after making changes

### "Invalid certificate format"

- Verify certificates include `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----` markers
- Check that newlines are properly handled (use `\n` or actual newlines)
- Ensure no extra whitespace or invalid characters

### Metadata endpoint returns JSON error

- Check that all required variables are set
- Verify certificate format is correct
- Check server logs for detailed error messages

## Next Steps

After setting up environment variables:

1. ✅ Verify metadata endpoint works: `curl http://localhost:3000/api/auth/saml/metadata`
2. 📋 Register your SP with Stanford's Service Provider Database (SPDB)
3. 🔗 Provide Stanford with your metadata URL
4. 🧪 Test the complete SSO login flow

