import React from 'react'
import ReactDOMServer from 'react-dom/server'
import App from './App'

export function render(url, ssrData) {
	return ReactDOMServer.renderToString(
		<React.StrictMode>
			<App data={ssrData} />
		</React.StrictMode>
	)
}
