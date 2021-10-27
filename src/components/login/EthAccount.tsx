import { isConnected } from "@/eth/connectors";
import { Jazzicon } from "@ukstv/jazzicon-react";
import { useWeb3React } from "@web3-react/core";

export default function EthAccount() {
  const { connector, account } = useWeb3React();

  if (isConnected(connector) && account)
    return (
      <div className="inline-block px-3 py-2 mb-5 text-base">
        <div
          style={{ width: "15px", height: "15px" }}
          className="inline-block mr-2"
        >
          <Jazzicon address={account} />
        </div>
        {account.substring(0, 6)}...
        {account.substring(account.length - 4)} {" "}
      </div>
    );

  return null;
}
