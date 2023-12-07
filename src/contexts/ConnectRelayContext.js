import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { ApiPromise, WsProvider } from "@polkadot/api";
import { useLocalStorageContext } from './LocalStorageContext';
import { useApiContextPara } from './ConnectParaContext'
import { useConfiguratorFormContext } from './ConfiguratorFormContext'

import useHealthCheck from '../hooks/useHealhCheck';
import useApiSubscription from '../hooks/unSubHook';
import { Keyring } from "@polkadot/keyring";

import { parseSchedule } from '../utilities/parseSchedule'

import { generateId } from '../utilities/generateId'

const ApiContextRC = createContext();

const ROCOCO_MIN_COST = 10000001;

export function ApiConnectRC ({ children }) {
    const { network, restart, setCoretime, coretime } = useLocalStorageContext();
    const { paraID } = useApiContextPara();

    const formCoretime = useConfiguratorFormContext().coretime
    const setFormCoretime = useConfiguratorFormContext().setCoretime

    const [api, setConnectedApi] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [provider, setProvider] = useState(null);
    const [rcHeadInfo, setrcHeadInfo] = useState(null);
    const [coretimeSchedule, setCoretimeSchedule] = useState([])
    const [paraHead, setParaHead] = useState(null);
    const [paraCodeHash, setParaCodeHash] = useState(null);
    const [paraStatus, setParaStatus] = useState(null);

    const [statusAditional, setStatusAditional] = useState("")
    const [statusCancel, setStatusCancel] = useState("")

    useEffect(() =>{
        const startApi = async () => {
            await selectNetworkRPC(wsUri);
        }
        const wsUri = network?.relay?.[0]?.wsUri;
        if(!provider && wsUri){
            startApi(wsUri);
        }
        const getSchedule = async () => {
          const schedule = await api.query.scheduler.agenda.entries();
          const _coretimeSchedule = parseSchedule(schedule, api)
          setCoretimeSchedule(_coretimeSchedule)
        }
    
        const getParaHead = async () => {
          const _paraHead = await (await api.query.paras.heads(paraID)).toHuman()
          setParaHead(_paraHead)
        }
    
        const getParaCodeHash = async () => {
          const _paraCodeHash = await (await api.query.paras.currentCodeHash(paraID)).toHuman()
          setParaCodeHash(_paraCodeHash)
        }

        const getParaStatus = async () => {
          const _paraStatus = await (await api.query.paras.paraLifecycles(paraID)).toHuman()
          setParaStatus(_paraStatus)
        }
    
        if(api && paraID) {
          getSchedule();
          getParaHead();
          getParaCodeHash();
          
          if(paraStatus !== 'Parathread'){
            //The moment it's a Parathread we don't want to change the status anymore.
            getParaStatus();
          }

        }
    }, [network, api, paraID, rcHeadInfo])

    //Get relaychainHead information
    const getNewRCHeads = useCallback(() => {
        if(api){
        return api.rpc.chain.subscribeNewHeads((lastHeader) => {
            const head =  lastHeader.toHuman().number
            setrcHeadInfo(head)
        })
        }
    }, [api]);

    useApiSubscription(getNewRCHeads, isReady);

    useHealthCheck(async ()=> {restart(); cleanupState()},network);

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
    const cleanupState = async  () => {
        setIsReady(false);
        setConnectedApi(null);
        setProvider(null)
        await provider.disconnect();
    }

    const scheduleAdditional = async () => {
      if(!paraID || !formCoretime.amount || !formCoretime.every) return;
      
      let scheduledBlock;
      if (!formCoretime.when || formCoretime.when < parseInt(rcHeadInfo) + parseInt(5)) {
        scheduledBlock = parseInt(rcHeadInfo) + parseInt(5);
      } else {
        scheduledBlock = formCoretime.when;
      }
      
      const id = generateId();
      const keyring = new Keyring({ type: 'sr25519' })
      
      const alice = keyring.addFromUri('//Alice');
      
      const onDemandCall = api.tx.onDemandAssignmentProvider.forcePlaceOrder(alice.address, ROCOCO_MIN_COST, paraID);
      
      const schedule = api.tx.scheduler.scheduleNamed(id, scheduledBlock, [formCoretime.every, formCoretime.amount], 0, onDemandCall);
      
      await api.tx.sudo
        .sudo(schedule) 
        .signAndSend(alice,({ events = [], status }) => {
          if (status.isInBlock || status.isFinalized) {
            setFormCoretime({amount: null, every: null, when:null})
            setStatusAditional("")
          } else {
            setStatusAditional(status.type)
          }
      });
      setStatusAditional("")

    }

    const scheduleCall = async () => {
        //We want to schedule only if the parachain is onboarded
        //This is used only at the very beginning
        if(!paraID) return;
        
        const scheduledBlock = parseInt(rcHeadInfo) + parseInt(5);

        const id = generateId();
        const keyring = new Keyring({ type: 'sr25519' })
        
        const alice = keyring.addFromUri('//Alice');
        
        const onDemandCall = api.tx.onDemandAssignmentProvider.forcePlaceOrder(alice.address, ROCOCO_MIN_COST, paraID);
        
        const schedule = api.tx.scheduler.scheduleNamed(id, scheduledBlock, [coretime.every,coretime.amount], 0, onDemandCall);
        
        await api.tx.sudo
          .sudo(schedule) 
          .signAndSend(alice,({ events = [], status }) => {
            if (status.isInBlock) {
              setCoretime({...coretime, scheduled: true})
            } else {
              // console.log('Status of schedule: ' + status.type);
            }

            events.forEach(({ phase, event: { data, method, section } }) => {
              // console.log(phase.toString() + ' : ' + section + '.' + method + ' ' + data.toString());
            });
        });
    }

    useEffect(() => {
        const schedule = async () => {
            await scheduleCall()
        }
        
        if (isReady && api && paraStatus === 'Parathread' && !coretime.scheduled) {
          schedule()
        }
    },[paraStatus])

    const cancelScheduled = async (id) => {
      if(!!statusCancel.length) return
      
      const keyring = new Keyring({ type: 'sr25519' })
      const alice = keyring.addFromUri('//Alice');
      const schedule = api.tx.scheduler.cancelNamed(id);
      await api.tx.sudo
      .sudo(schedule) 
        .signAndSend(alice,({ events = [], status }) => {
          if (status.isInBlock || status.isFinalized) {
            setStatusCancel("")
          } else {
            setStatusCancel(status.type)
          }
      });
        
    }

    return (
        <ApiContextRC.Provider value={{api, isReady, coretimeSchedule, scheduleCall, paraHead, paraCodeHash, scheduleAdditional, statusAditional, paraStatus, cancelScheduled, statusCancel, rcHeadInfo}}>
            { children }
        </ApiContextRC.Provider>
    );
};

export function useApiContextRC () {
    return useContext(ApiContextRC)
}