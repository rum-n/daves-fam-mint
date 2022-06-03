import React, { setGlobal } from 'reactn';
import ReactDOM from 'react-dom';
import './assets/css/style.css';
import App from './App';


// global storage
setGlobal({
    address: null,
    network: null,
});


ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);
