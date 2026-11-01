import path from 'node:path';
import fs from 'fs-extra';
import forge from 'node-forge';

export interface KeystoreInfo {
  privateKey: forge.pki.rsa.PrivateKey;
  certificate: forge.pki.Certificate;
}

export interface KeystoreSigningConfig {
  alias: string;
  storePassword: string;
  keyPassword: string;
}

export const DEFAULT_KEYSTORE_PASSWORD = '';
export const DEFAULT_KEYSTORE_ALIAS = 'porth';
const KEYSTORE_PASSWORD = DEFAULT_KEYSTORE_PASSWORD;
const KEYSTORE_ALIAS = DEFAULT_KEYSTORE_ALIAS;

export function getDefaultKeystoreSigningConfig(): KeystoreSigningConfig {
  return {
    alias: KEYSTORE_ALIAS,
    storePassword: KEYSTORE_PASSWORD,
    keyPassword: KEYSTORE_PASSWORD,
  };
}

export async function ensureKeystore(porthDir: string): Promise<KeystoreInfo> {
  const keystorePath = path.join(porthDir, 'keystore', 'release.p12');
  if (await fs.pathExists(keystorePath)) {
    const keystoreBuffer = await fs.readFile(keystorePath);
    return parseKeystore(keystoreBuffer);
  }

  await fs.ensureDir(path.dirname(keystorePath));
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = `${Date.now()}`;
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date(Date.now() + 25 * 365 * 24 * 60 * 60 * 1000);

  const attributes = [
    { name: 'commonName', value: 'Porth App' },
    { name: 'organizationName', value: 'Porth' },
    { shortName: 'C', value: 'US' },
  ];
  cert.setSubject(attributes);
  cert.setIssuer(attributes);
  cert.sign(keys.privateKey, forge.md.sha256.create());

  const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
    keys.privateKey,
    [cert],
    KEYSTORE_PASSWORD,
    { friendlyName: KEYSTORE_ALIAS },
  );
  const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
  await fs.writeFile(keystorePath, Buffer.from(p12Der, 'binary'));

  console.log('🔑 Keystore created → .porth/keystore/release.p12');
  console.log('⚠️  Back this file up. Losing it means you cannot update your app on devices.');

  return { privateKey: keys.privateKey, certificate: cert };
}

function parseKeystore(keystoreBuffer: Buffer): KeystoreInfo {
  const p12Der = forge.util.createBuffer(keystoreBuffer.toString('binary'));
  const p12Asn1 = forge.asn1.fromDer(p12Der);
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, KEYSTORE_PASSWORD);

  const keyBags = p12.getBags({
    bagType: forge.pki.oids.pkcs8ShroudedKeyBag,
    friendlyName: KEYSTORE_ALIAS,
  })[forge.pki.oids.pkcs8ShroudedKeyBag];
  const certBags = p12.getBags({
    bagType: forge.pki.oids.certBag,
    friendlyName: KEYSTORE_ALIAS,
  })[forge.pki.oids.certBag];

  const privateKey = keyBags?.[0]?.key;
  const certificate = certBags?.[0]?.cert;
  if (!privateKey || !certificate) {
    throw new Error('Invalid keystore: missing key or certificate');
  }
  return { privateKey, certificate };
}
