import React from 'react'
import ReactDOMClient from 'react-dom/client'
import App from './App'

const __SSR_DATA = undefined

ReactDOMClient.hydrateRoot(
	document.getElementById('root'),
	<React.StrictMode>
		<App data={__SSR_DATA} />
	</React.StrictMode>
)
