export const cancelDeployment = async ({configurationContext, localStorageContext, apiContextPara, apiContextRC}) => {
    console.log('running')
    const response = await fetch(`${process.env.REACT_APP_API_URL}/network/stop`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    localStorageContext.setNetworkStatus(data.result);
    
    if (data.result === 'OK') {
        localStorageContext.restart();
        configurationContext.restartForm();
        apiContextPara.cleanupState();
        apiContextRC.cleanupState();
    } else {
        // setStateStatus({executing: 'failed', status: 'danger', message: 'Configuration Submission Failed'});
    }
    
    return data;
    
}