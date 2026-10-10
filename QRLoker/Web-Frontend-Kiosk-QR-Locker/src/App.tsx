import { RouterProvider } from 'react-router-dom'
import dayjs from 'dayjs'
import router from './route'

import 'dayjs/locale/id'
dayjs.locale('id')

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
