//This function will return just the onDemandAssingment schedule
//It will bring back an array with all scheduled calls that are for onDemandAssingment
// Each item will have an object where scheduleID

import { PJStringToNumber } from '../utilities/PJSstringToNumber'

export const parseSchedule = (schedule, api) => {
    let data = [];
    schedule.forEach(([block_execution, call_data])=>{
        //block_execution has the information of the block at which the scheduler is scheduled to be triggered
        //call_data is an array of the calls that will be triggered at the block_execution height
        //filter only for calls that are to create a onDemandAssignmentProvider for a paraID.
        //It returns the amount left to be executed.
        const block = PJStringToNumber(block_execution.toHuman()[0])
        const actions = call_data.toHuman();
            actions.map(value =>{
                //this value has the scheduler info.
                //from here we can get: (1) periodicity of the call; (2) number of calls remaining; (3) call itsef that needs to be decoded)
                if(value && value.call.Inline){
                    //we need to add one for amount as the scheduler executes also on '0'
                    const frequency = value.maybePeriodic ? PJStringToNumber(value.maybePeriodic[0]) : 1
                    const amount = value.maybePeriodic ?  PJStringToNumber(value.maybePeriodic[1]) + 1 : 1
                    
                    const tx = api.createType('Call', value.call.Inline);
                    const humanTx = tx.toHuman();
                    const paraTargetNumber = PJStringToNumber(humanTx.args.para_id)

                    if (humanTx.section === "onDemandAssignmentProvider"){
                        //This scheduled action is now an onDemandAssingmentProvider
                        data.push({
                            block,
                            schedulerId: value.maybeId ? value.maybeId : "",
                            paraId: paraTargetNumber,
                            frequency,
                            amount
                        })
                    }
                }
           })
    })
    
    return data
} 