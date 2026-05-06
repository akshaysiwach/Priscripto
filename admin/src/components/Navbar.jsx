import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'

const DEFAULT_PROFILE_IMAGE = 'https://i.pravatar.cc/150?img=47'

const Navbar = () => {

  const { dToken, setDToken, doctorName, setDoctorName, profileData } = useContext(DoctorContext)
  const { aToken, setAToken, adminEmail, setAdminEmail } = useContext(AdminContext)

  const navigate = useNavigate()

  const logout = () => {
    navigate('/')
    dToken && setDToken('')
    dToken && localStorage.removeItem('dToken')
    dToken && localStorage.removeItem('doctorName')
    dToken && setDoctorName('Doctor')
    aToken && setAToken('')
    aToken && localStorage.removeItem('aToken')
    aToken && localStorage.removeItem('adminEmail')
    aToken && setAdminEmail('Admin')
  }

  const displayName = aToken ? adminEmail : doctorName

  const profileImage = dToken ? profileData?.image || DEFAULT_PROFILE_IMAGE : DEFAULT_PROFILE_IMAGE

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
      <div className='flex items-center gap-2 text-xs'>
        <img onClick={() => navigate('/')} className='w-36 sm:w-40 cursor-pointer' src={assets.admin_logo} alt="" />
        <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600'>{aToken ? 'Admin' : 'Doctor'}</p>
      </div>
      <div className='flex items-center gap-3'>
        <img className='w-10 h-10 rounded-full object-cover bg-slate-100' src={profileImage} alt="Profile" />
        <span className='hidden sm:block text-sm font-medium text-gray-700 max-w-[220px] truncate'>{displayName}</span>
        <button onClick={() => logout()} className='bg-primary text-white text-sm px-10 py-2 rounded-full'>Logout</button>
      </div>
    </div>
  )
}

export default Navbar
