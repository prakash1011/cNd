import { WebContainer } from '@webcontainer/api';

let webContainerInstance = null;
let initializationInProgress = false;
let initializationError = null;

export const getWebContainer = async () => {
    // If we already have an instance, return it
    if (webContainerInstance !== null) {
        return webContainerInstance;
    }
    
    // If there was a previous error, throw it again
    if (initializationError) {
        console.error('Previous WebContainer initialization failed:', initializationError);
        throw initializationError;
    }
    
    // If initialization is in progress, wait for it
    if (initializationInProgress) {
        console.log('WebContainer initialization already in progress, waiting...');
        // Wait for initialization to complete or fail
        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
                if (webContainerInstance) {
                    clearInterval(checkInterval);
                    resolve(webContainerInstance);
                } else if (initializationError) {
                    clearInterval(checkInterval);
                    reject(initializationError);
                }
            }, 100);
        });
    }
    
    // Start initialization
    try {
        initializationInProgress = true;
        console.log('Initializing WebContainer...');
        
        // Add a timeout to prevent hanging if boot takes too long
        const bootPromise = WebContainer.boot();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('WebContainer initialization timed out')), 10000)
        );
        
        webContainerInstance = await Promise.race([bootPromise, timeoutPromise]);
        console.log('WebContainer initialized successfully');
        return webContainerInstance;
    } catch (error) {
        console.error('Failed to initialize WebContainer:', error);
        initializationError = error;
        throw error;
    } finally {
        initializationInProgress = false;
    }
}