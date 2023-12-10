import React from 'react'
import { useConfiguratorFormContext } from 'src/contexts/ConfiguratorFormContext'
import {Link} from 'react-router-dom'
import { CRow, CButtonToolbar, CButtonGroup, CButton, CCard ,CCardImage ,CCardBody ,CCardTitle,CCardText, CCol} from '@coreui/react'

import collatorImage from '../../assets/images/colllator.png'

const ConfiguratorCollators = () => {

  const { collators, setCollators } = useConfiguratorFormContext();

  const handleClick = (qty) => {
    setCollators(qty)
  }

  const maxAmount = Array.from({ length: 10 }).fill(null);

  return (
    <>
      <CRow className='d-flex flex-row'>
          <p className='fs-5 fw-light'>Pick the number of collators to be deployed.</p>
          <CRow xs={{ cols: 1, gutter: 2 }} xl={{ cols: 4, gutter: 3 }}>
            {maxAmount.map((val, index)=> {
              let numberOfCollators = index + 1
              let item;
              if(numberOfCollators === 1) {
                item = (
                  <CCol xs>
                    <CCard style={{ width: '18rem' }}>
                      <CCardImage orientation="top" src={`/collator.png`} />
                      <CCardBody className='d-flex flex-row justify-content-around align-items-center'>
                        <CButton className='fw-light' active={collators === numberOfCollators ? true : false} onClick={() => handleClick(numberOfCollators)} color="info" variant="outline">{numberOfCollators} Collator</CButton>
                      </CCardBody>
                    </CCard>
                  </CCol>
                )
              } else {
                item = (
                  <CCol xs>
                    <CCard style={{ width: '18rem' }}>
                      <CCardImage orientation="top" src={`/collator.png`} />
                      <CCardBody className='d-flex flex-row justify-content-around align-items-center'>
                        <CButton className='fw-light' active={collators === numberOfCollators ? true : false} onClick={() => handleClick(numberOfCollators)} color="info" variant="outline">{numberOfCollators} Collators</CButton>
                      </CCardBody>
                    </CCard>
                  </CCol>
                )
              }
              return item
            })}
          </CRow>      
      </CRow>
      <CRow className='mt-4 mb-4'>
        <Link className='text-center' to="/configure">
          <CButton variant='outline' color='success' className='fw-light'>Confirm</CButton>
        </Link>
      </CRow>
    </>
  );
};

export default ConfiguratorCollators

