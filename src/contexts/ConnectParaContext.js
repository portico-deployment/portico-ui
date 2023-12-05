import React, { createContext, useState, useEffect, useContext } from 'react';
import { ApiPromise, WsProvider } from "@polkadot/api";

//ToDo: change logic to make this connect to the parachain node spawned by Portico
const AH_ROCOCO_RPC ='wss://rococo-asset-hub-rpc.polkadot.io'

const ApiContextPara = createContext();

export function ApiConnectPara ({ children }) {
    const [api, setConnectedApi] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [provider, setProvider] = useState(null);

    // by default this connects to Polkadot
    useEffect(() =>{
        const startApi = async () => {
            await selectNetworkRPC(AH_ROCOCO_RPC);
        }
        if(!provider){
            startApi();
        }
    })

    //CONNECTS TO RPC
    const selectNetworkRPC = async (rpc) => {
        
        //If user changes network it will first disconnect the current ws connection.
        if(provider){
            await provider.disconnect();
        }

        if(rpc){
            const newProvider = new WsProvider(rpc);
            setProvider(newProvider)
            const _api = await ApiPromise.create({ provider: newProvider });
            setIsReady(_api._isReady);
            setConnectedApi(_api)
        }
    };

    //State cleaner to be used when changing networks
    const cleanupState = () => {
        setIsReady(false);
        setConnectedApi(null);
        setProvider(null)
    }

    return (
        <ApiContextPara.Provider value={{api, isReady}}>
            { children }
        </ApiContextPara.Provider>
    );
};

export function useApiContextPara () {
    return useContext(ApiContextPara)
}