import { expect } from "chai";
import { Vault, vaultFromHexString, vaultToHexString } from "./vault";

describe("vault", () => {
  it("can be encrypted & decrypted", () => {
    const vault: Vault = {
      alice: "alice-private-key",
      bob: "bob-private-key",
    };
    const secret = "supersecret";

    const encodedEncryptedVault = vaultToHexString(secret, vault);

    expect(encodedEncryptedVault).to.be.a("string");

    const decodedDecryptedVault = vaultFromHexString(secret, encodedEncryptedVault);

    expect(decodedDecryptedVault).to.be.an("object");
    expect((decodedDecryptedVault as any).alice).to.eql("alice-private-key");
    expect((decodedDecryptedVault as any).bob).to.eql("bob-private-key");
  });

  it("fails to decrypt a vault when using a wrong secret", () => {
    const encodedEncryptedVault =
      "2ba6a3a892b89f4422db9f7a39b1279b7db7c93144dd7e58946dc59aec21d22168c0255db6921f7b0c0ffb7213a095eb4bfbb670eb";

    expect(() => vaultFromHexString("wrong secret", encodedEncryptedVault)).to.throw(Error);
  });
});
