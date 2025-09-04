// Dùng trong Cloudflare Workers/Hono (runtime có crypto.subtle)
const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

function b64url(u8) {
    const s = typeof u8 === "string" ? u8 : String.fromCharCode(...u8);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function getAccessToken(env) {
    const email = env.GOOGLE_CLIENT_EMAIL;
    const pkPem = env.GOOGLE_PRIVATE_KEY;

    if (!email || !pkPem) throw new Error("Missing GOOGLE_CLIENT_EMAIL/GOOGLE_PRIVATE_KEY");

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: "RS256", typ: "JWT" };
    const payload = {
        iss: email,
        scope: SCOPE,
        aud: OAUTH_TOKEN_URL,
        iat: now,
        exp: now + 3600
    };

    const unsigned =
        b64url(new TextEncoder().encode(JSON.stringify(header))) + "." +
        b64url(new TextEncoder().encode(JSON.stringify(payload)));

    // import private key (PKCS8 PEM)
    const pkcs8 = pkPem
        .replace(/-----BEGIN PRIVATE KEY-----/g, "")
        .replace(/-----END PRIVATE KEY-----/g, "")
        .replace(/\s+/g, "");
    const keyData = Uint8Array.from(atob(pkcs8), (c) => c.charCodeAt(0));

    const key = await crypto.subtle.importKey(
        "pkcs8",
        keyData,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const sigBuf = await crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        key,
        new TextEncoder().encode(unsigned)
    );
    const jwt = unsigned + "." + b64url(new Uint8Array(sigBuf));

    const resp = await fetch(OAUTH_TOKEN_URL, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: jwt
        })
    });
    if (!resp.ok) throw new Error(`OAuth ${resp.status} ${await resp.text()}`);
    const json = await resp.json();
    return json.access_token;
}

async function ga4RunReport(env, body) {
    const token = await getAccessToken(env);
    const property = env.GA4_PROPERTY_ID;
    if (!property) throw new Error("Missing GA4_PROPERTY_ID");

    const url = `https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`;
    const r = await fetch(url, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(`runReport ${r.status} ${await r.text()}`);
    return r.json();
}

async function ga4RunRealtime(env, body) {
    const token = await getAccessToken(env);
    const property = env.GA4_PROPERTY_ID;
    if (!property) throw new Error("Missing GA4_PROPERTY_ID");

    const url = `https://analyticsdata.googleapis.com/v1beta/properties/${property}:runRealtimeReport`;
    const r = await fetch(url, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(`realtime ${r.status} ${await r.text()}`);
    return r.json();
}

export { ga4RunReport, ga4RunRealtime };
