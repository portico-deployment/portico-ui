import React, {useState, useRef, useEffect} from 'react'
import {CRow, CCol, CCard, CCardBody, CCardTitle, CCardText, CContainer, CCardFooter, CToast, CToaster, CToastBody, CToastClose, CButton, CModal, CSpinner} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilWallet, cilAlarm, cilLoopCircular, cilXCircle } from '@coreui/icons'

import GetMore from './GetMore'

//CONTEXT
import { useApiContextRC } from '../../contexts/ConnectRelayContext'
import { useApiContextPara } from '../../contexts/ConnectParaContext'

//UTILITIES
import { cutHash } from '../../utilities/handleHash'

const Coretime = () => {
  //STATE MANAGEMENT
  const [toastCopy, setToastCopy] = useState(0)
  const [visible, setVisible] = useState(false)
  const [cancellingID, setCancellingID] = useState("")

  const toaster = useRef()
  const {paraID} = useApiContextPara();
  const {coretimeSchedule, cancelScheduled, statusAditional, statusCancel} = useApiContextRC();

  const paraCoretime = coretimeSchedule?.filter(val => val.paraId = paraID).sort((ticket1, ticket2) => ticket1.block - ticket2.block)

  const handleCopyClick = (id) => {
    navigator.clipboard.writeText(id)
    const message = (
      <CToast autohide={true} visible={true} color="success" className="text-white align-items-center">
        <div className="d-flex">
          <CToastBody>Copied to Clipboard!</CToastBody>
        </div>
      </CToast>
    )
    setToastCopy(message)
  }

  const handleDeleteTicket = async (id) => {
    setCancellingID(id)
    await cancelScheduled(id)

  }
  
  return (
    <CContainer>
      <CRow className='d-flex align-items-center mb-4'>
        <CCol xl={{span : 10}}>
          <h3>Coretime Credit Tickets</h3>
        </CCol>
        <CCol xl={{span: 2}} className='d-flex justify-content-end pe-5'>
          {
            (statusAditional === 'Ready' || statusAditional === 'Broadcast') 
              ? <CSpinner color="secondary" />
              :(
                <CButton color="link" className='text-nowrap pe-0' onClick={() => setVisible(!visible)}>
                  <CIcon className="text-dark" size="xl" icon={cilPlus} />
                </CButton>    
              )
          }
          <CModal alignment="center" visible={visible} onClose={() => setVisible(false)} aria-labelledby="VerticallyCenteredExample">
            <GetMore setVisible={setVisible} />
          </CModal>
        </CCol>
      </CRow>
      <CRow xl={{ cols: 3, gutter: 4 }} xs={{cols:1, gutter: 2}} md={{cols:2, gutter: 2}}>
        {paraCoretime && paraCoretime.map(coretimeTicket =>{
          return (
          <CCol key={coretimeTicket.schedulerId} xs>
            <CCard>
              <CCardBody>
                <CCardTitle className='d-flex align-items-center'>
                  <CCol md={10}>
                    Coretime Ticket
                  </CCol>
                  <CCol md={2} className='d-flex justify-content-end'>
                    { (!statusCancel.length) ?
                      <CButton color="link" className='text-nowrap pe-0' onClick={() => handleDeleteTicket(coretimeTicket.schedulerId)}>
                        <CIcon size='xl' className="text-danger" icon={cilXCircle} />
                      </CButton> 
                      : (coretimeTicket.schedulerId === cancellingID) ?
                      <CButton color="link" className='text-nowrap pe-0'>
                        <CSpinner size='sm' style={{ width: '1.5rem', height: '1.5rem'}} color="danger" />
                      </CButton>
                      :
                      <CButton color="link" className='text-nowrap pe-0'>
                        <CIcon size='xl' className="text-danger" icon={cilXCircle} />
                      </CButton> 
                    }
                  </CCol>
                </CCardTitle>
                <CCardText>
                  <CContainer>
                    <CRow>
                      <CRow>
                        <CCol xl={{span:1}}>
                          <CIcon size="lg" icon={cilAlarm}/>
                        </CCol>
                        <CCol xl={{span:11}}>
                          Next Execution [Relaychain Block]
                        </CCol>
                      </CRow>
                      <CRow className='text-center'>
                        {coretimeTicket && coretimeTicket.block}
                      </CRow>
                    </CRow>
                    <CRow>
                      <CRow>
                          <CCol xl={{span:1}}>
                            <CIcon size="lg" icon={cilLoopCircular}/>
                          </CCol>
                          <CCol xl={{span:11}}>
                            Execution Frequency
                          </CCol>
                        </CRow>
                        <CRow className='text-center'>
                          {coretimeTicket && coretimeTicket.frequency}
                        </CRow>
                    </CRow>
                    <CRow>
                      <CRow>
                          <CCol xl={{span:1}}>
                            <CIcon size="lg" icon={cilWallet}/>
                          </CCol>
                          <CCol xl={{span:11}}>
                            Credits Left on Ticket
                          </CCol>
                        </CRow>
                        <CRow className='text-center'>
                          {coretimeTicket && coretimeTicket.amount}
                        </CRow>
                    </CRow>
                  </CContainer>
                </CCardText>
              </CCardBody>
              <CCardFooter onClick={() => handleCopyClick(coretimeTicket.schedulerId)}>
                <CToaster ref={toaster} push={toastCopy} placement="top-end" />
                Ticket ID: {coretimeTicket && cutHash(coretimeTicket.schedulerId)}
              </CCardFooter>
            </CCard>
          </CCol>
          )
        })}
      </CRow>
    </CContainer>
  )
}

export default Coretime
