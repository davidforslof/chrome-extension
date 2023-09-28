import React from 'react';
import { createRoot } from 'react-dom/client';

import Popup from './Popup';
import './index.css';

const body = document.getElementById("body");
const root = createRoot(body);
root.render(<Popup />);
