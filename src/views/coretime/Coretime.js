import React, {useState, useRef, useEffect} from 'react'
import {CRow, CCol, CCard, CCardBody, CCardTitle, CCardText, CContainer, CCardFooter, CToast, CToaster, CToastBody, CButton, CModal, CSpinner, CPopover} from '@coreui/react'
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
  const {coretimeSchedule, cancelScheduled, statusAditional, statusCancel, paraStatus, rcHeadInfo} = useApiContextRC();

  const paraCoretime = coretimeSchedule?.filter(val => val.paraId = paraID).sort((ticket1, ticket2) => ticket1.block - ticket2.block)
  const lastBlockScheduled = paraCoretime.length ? ( paraCoretime[paraCoretime.length - 1].block + paraCoretime[paraCoretime.length - 1].amount * paraCoretime[paraCoretime.length - 1].frequency) : 0; 
  const minPossibleBlock = Math.max(lastBlockScheduled, parseInt(rcHeadInfo))
  
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
            (statusAditional === 'Ready' || statusAditional === 'Broadcast' || paraStatus === 'Onboarding') 
              ? <CSpinner color="secondary" />
              :(
                <CButton color="link" className='text-nowrap pe-0' onClick={() => setVisible(!visible)}>
                  <CIcon className="text-dark" size="xl" icon={cilPlus} />
                </CButton>    
              )
          }
          <CModal alignment="center" visible={visible} onClose={() => setVisible(false)} aria-labelledby="VerticallyCenteredExample">
            <GetMore setVisible={setVisible} minBlock={minPossibleBlock}/>
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
                  <CContainer>
                    <CRow className='mb-2'>
                      <CCol xl={{span: 6}}>
                        <CPopover className={'fw-lighter'} content="Next Execution [Relaychain Block]" placement="top" trigger={['hover', 'focus']}>
                          <CIcon className='mb-1' size="xl" icon={cilAlarm}/>  
                        </CPopover>
                      </CCol>
                      <CCol className='fs-5' xl={{span: 6}}>
                        {coretimeTicket && coretimeTicket.block}
                      </CCol>
                    </CRow>
                    <CRow className='mb-2'>
                      <CCol xl={{span: 6}}>
                        <CPopover className={'fw-lighter'} content="Execution Frequency" placement="top" trigger={['hover', 'focus']}>
                          <CIcon className='mb-1' size="xl" icon={cilLoopCircular}/>  
                        </CPopover>
                      </CCol>
                      <CCol className='fs-5' xl={{span: 6}}>
                        {coretimeTicket && coretimeTicket.frequency}
                      </CCol>
                    </CRow>
                    <CRow className='mb-2'>
                      <CCol xl={{span: 6}}>
                        <CPopover className={'fw-lighter'} content="Credits Left on Ticket" placement="top" trigger={['hover', 'focus']}>
                          <CIcon className='mb-1' size="xl" icon={cilWallet}/>  
                        </CPopover>
                      </CCol>
                      <CCol className='fs-5' xl={{span: 6}}>
                        {coretimeTicket && coretimeTicket.amount}
                      </CCol>
                    </CRow>
                  </CContainer>
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
