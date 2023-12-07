import React, {useState, useRef} from 'react'

import {CButton, CModalHeader, CModalTitle, CModalBody, CModalFooter, CFormInput, CRow, CCol, CForm} from '@coreui/react'

import { useApiContextRC } from '../../contexts/ConnectRelayContext'
import { useConfiguratorFormContext } from '../../contexts/ConfiguratorFormContext'

const GetMore = ({setVisible, minBlock}) => {
    const { coretime, setCoretime } = useConfiguratorFormContext();
    const { rcHeadInfo, scheduleAdditional } = useApiContextRC();
    
    const [validWhen, setValidWhen] = useState(true)
    const [validAmount, setValidAmount] = useState(true)
    const [validEvery, setValidEvery] = useState(true)
    const [validated, setValidated] = useState(true)

    const handleWhenChange = (event) => {
        let proposedWhen = Math.floor(Number(event.target.valueAsNumber));
        if(proposedWhen < (minBlock + 10)){
            setValidWhen(false)
        } else {
            setValidWhen(true)
        }
        setCoretime({...coretime, when: proposedWhen})
    }

    const handleAmountChange = (event) => {
        let amount = Math.floor(Number(event.target.valueAsNumber));
        if (event.target.valueAsNumber > 10000){
          setValidAmount(false)
        } else {
          setValidAmount(true)
        }
        setCoretime({...coretime, amount})
      }
    
      const handleEveryChange = (event) => {
        let every = Math.floor(Number(event.target.valueAsNumber));
        if (event.target.valueAsNumber > 1000){
          setValidEvery(false)
        } else {
          setValidEvery(true)
        }
        setCoretime({...coretime, every})
      }
    
      const handleSubmit = async (event) => {
        const form = event.currentTarget
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        } else {
          event.preventDefault()
          await scheduleAdditional()
          setVisible(false)
        }
        setValidated(true)
      }

    return(
        <CForm className="needs-validation" noValidate onSubmit={handleSubmit} validated={validated}>
        <CModalHeader>
              <CModalTitle id="VerticallyCenteredExample">Get more Coretime</CModalTitle>
            </CModalHeader>
            <CModalBody>
                    <CFormInput 
                    className='fw-lighter mb-4'
                    onChange={() => handleWhenChange(event)}
                    min={minBlock + 10}
                    invalid={!validWhen} 
                    step={1} 
                    required
                    type="number" 
                    value={coretime.when ? coretime.when : ""} 
                    size="lg" 
                    aria-label="lg input example"
                    feedbackInvalid={validWhen ? "" : `Needs to be at least ${minBlock + 10}`}
                    label={`Execution Block. Needs to be more than maximum between scheduled and current Relaychain head. Earliest possible (${minBlock + 10}).`}
                    />
                    <CFormInput 
                    className='fw-lighter mb-4'
                      max={10000}
                      onChange={() => handleAmountChange(event)}
                      invalid={!validAmount} 
                      step={1} 
                      type="number" 
                      value={coretime.amount ? coretime.amount : ""} 
                      size="lg" 
                      aria-label="lg input example"
                      required
                      feedbackInvalid={validAmount ? "" : "Please make it an integer below 10_000"}
                      label="Amount. Parachain Blocks to be validated"
                    />
                    <CFormInput
                    className='fw-lighter mb-4' 
                    max={1000}
                    step={1}
                    onChange={(event) => handleEveryChange(event)}
                    invalid={!validEvery} 
                    label="Frequency. Every how many Relaychan Blocks should Parachain blocks be validated"
                    type="number"
                    value={coretime.every ? coretime.every : ""}
                    size="lg"
                    aria-label="lg input example"
                    required
                    feedbackInvalid={validEvery ? "" : "Please make it an integer below 1_000"}
                    />
            </CModalBody>
            <CModalFooter>
              <CButton className='fw-lighter' variant="outline" color="dark" onClick={() => setVisible(false)}> Close </CButton>
              <CButton className='fw-lighter' variant="outline" type='submit' color="success">Submit</CButton>
            </CModalFooter>
        </CForm>
    )

}

export default GetMore
