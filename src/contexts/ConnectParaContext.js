import React, { createContext, useState, useEffect, useContext } from 'react';
import { ApiPromise, WsProvider } from "@polkadot/api";
import { useLocalStorageContext } from './LocalStorageContext';

const ApiContextPara = createContext();

export function ApiConnectPara ({ children }) {
    const { network } = useLocalStorageContext();
    const [api, setConnectedApi] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [provider, setProvider] = useState(null);

    // by default this connects to Polkadot
    useEffect(() =>{
        const startApi = async (wsUri) => {
            await selectNetworkRPC(wsUri);
        }

        const firstParasKey = Object.keys(network?.paras || {})[0];
        const wsUri = network?.paras?.[firstParasKey]?.[0]?.wsUri;
        if(!provider && wsUri){
            startApi(wsUri);
        }
    }, [network])

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