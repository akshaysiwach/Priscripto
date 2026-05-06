import React, { useContext, useEffect, useMemo, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const DEFAULT_PROFILE_IMAGE = 'https://i.pravatar.cc/150?img=47'

const DoctorDashboard = () => {
  const { dToken, dashData, getDashData, cancelAppointment, completeAppointment, profileData, getProfileData, toggleAvailability } = useContext(DoctorContext)
  const { slotDateFormat, currency } = useContext(AppContext)
  const [activeHistory, setActiveHistory] = useState('all')

  useEffect(() => {
    if (dToken) {
      getDashData()
      getProfileData()
    }
  }, [dToken])

  const statusClass = (status) => {
    if (status === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-100'
    if (status === 'cancelled') return 'bg-rose-50 text-rose-700 border-rose-100'
    if (status === 'scheduled' || status === 'rescheduled') return 'bg-amber-50 text-amber-700 border-amber-100'
    return 'bg-slate-50 text-slate-600 border-slate-100'
  }

  const historySections = useMemo(() => {
    if (!dashData) return {}

    const all = dashData.latestAppointments || []
    return {
      all: {
        title: 'Appointment History',
        subtitle: 'All of your recent bookings with status and patient details.',
        empty: 'No appointment history found.',
        rows: all,
      },
      pending: {
        title: 'Pending Appointments',
        subtitle: 'Appointments waiting for completion or cancellation.',
        empty: 'No pending appointments found.',
        rows: all.filter((appointment) => !appointment.cancelled && !appointment.isCompleted),
      },
      completed: {
        title: 'Completed Appointments',
        subtitle: 'Appointments you have completed successfully.',
        empty: 'No completed appointments found.',
        rows: all.filter((appointment) => appointment.isCompleted),
      },
      cancelled: {
        title: 'Cancelled Appointments',
        subtitle: 'Appointments that were cancelled by you or the patient.',
        empty: 'No cancelled appointments found.',
        rows: all.filter((appointment) => appointment.cancelled),
      },
    }
  }, [dashData])

  const summaryCards = dashData
    ? [
        { key: 'all', icon: assets.appointments_icon, value: dashData.appointments, label: 'All Appointments' },
        { key: 'pending', icon: assets.list_icon, value: dashData.pendingAppointments, label: 'Pending' },
        { key: 'completed', icon: assets.earning_icon, value: dashData.completedAppointments, label: 'Completed' },
        { key: 'cancelled', icon: assets.cancel_icon, value: dashData.cancelledAppointments, label: 'Cancelled' },
      ]
    : []

  const renderHistoryRows = () => {
    const section = historySections[activeHistory]
    if (!section) return null

    if (section.rows.length === 0) {
      return <p className="px-5 py-6 text-sm text-slate-500">{section.empty}</p>
    }

    return section.rows.map((item) => (
      <div key={item._id} className="grid gap-3 border-b last:border-b-0 px-5 py-4 text-sm md:grid-cols-[1.6fr_1fr_1fr_0.8fr]">
        <div>
          <p className="font-semibold text-slate-900">{item.userData?.name || 'Unknown Patient'}</p>
          <p className="text-slate-500">{item.userData?.email || item.userId}</p>
        </div>
        <div className="text-slate-600">{slotDateFormat(item.slotDate)}, {item.slotTime}</div>
        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${statusClass(item.status)}`}>
          {item.status || (item.cancelled ? 'cancelled' : item.isCompleted ? 'completed' : 'scheduled')}
        </span>
        <p className="font-semibold text-slate-700">{currency} {item.amount}</p>
      </div>
    ))
  }

  if (!dashData) return null

  const activeSection = historySections[activeHistory]

  return (
    <div className='m-5'>
      <div className='flex flex-wrap gap-3'>
        {summaryCards.map((card) => (
          <button
            key={card.key}
            type='button'
            onClick={() => setActiveHistory(card.key)}
            className={`flex min-w-52 items-center gap-2 rounded border-2 bg-white p-4 text-left transition-all hover:scale-[1.02] ${activeHistory === card.key ? 'border-primary shadow-sm' : 'border-gray-100'}`}
          >
            <img className='w-14' src={card.icon} alt='' />
            <div>
              <p className='text-xl font-semibold text-gray-600'>{card.value}</p>
              <p className='text-gray-400'>{card.label}</p>
            </div>
          </button>
        ))}
      </div>

      <div className='mt-6 grid gap-3 sm:grid-cols-3'>
        <div className='bg-slate-900 text-white rounded-2xl p-5'>
          <p className='text-sm text-slate-300'>Availability</p>
          <p className='text-2xl font-semibold mt-2'>{profileData?.available ? 'Open for bookings' : 'Currently paused'}</p>
          <button onClick={toggleAvailability} className='mt-4 rounded-full bg-white text-slate-900 px-4 py-2 text-sm font-medium'>
            {profileData?.available ? 'Pause booking' : 'Resume booking'}
          </button>
        </div>
        <button type='button' onClick={() => setActiveHistory('pending')} className={`rounded-2xl border p-4 text-left transition-all ${activeHistory === 'pending' ? 'border-amber-300 bg-amber-100 shadow-sm' : 'border-amber-100 bg-amber-50'}`}>
          <p className='text-sm text-amber-700'>Pending</p>
          <p className='text-2xl font-semibold text-amber-900 mt-1'>{dashData.pendingAppointments}</p>
        </button>
        <button type='button' onClick={() => setActiveHistory('completed')} className={`rounded-2xl border p-4 text-left transition-all ${activeHistory === 'completed' ? 'border-emerald-300 bg-emerald-100 shadow-sm' : 'border-emerald-100 bg-emerald-50'}`}>
          <p className='text-sm text-emerald-700'>Completed</p>
          <p className='text-2xl font-semibold text-emerald-900 mt-1'>{dashData.completedAppointments}</p>
        </button>
        <button type='button' onClick={() => setActiveHistory('cancelled')} className={`rounded-2xl border p-4 text-left transition-all ${activeHistory === 'cancelled' ? 'border-rose-300 bg-rose-100 shadow-sm' : 'border-rose-100 bg-rose-50'}`}>
          <p className='text-sm text-rose-700'>Cancelled</p>
          <p className='text-2xl font-semibold text-rose-900 mt-1'>{dashData.cancelledAppointments}</p>
        </button>
      </div>

      <div className='mt-8 overflow-hidden rounded-2xl border bg-white'>
        <div className='border-b px-5 py-4'>
          <div className='flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <p className='text-lg font-semibold text-slate-900'>{activeSection.title}</p>
              <p className='text-sm text-slate-500'>{activeSection.subtitle}</p>
            </div>
            <p className='text-sm font-medium text-slate-500'>{activeSection.rows.length} records</p>
          </div>
        </div>
        <div className='flex flex-wrap gap-2 border-b bg-slate-50 px-5 py-3'>
          {Object.keys(historySections).map((key) => (
            <button
              key={key}
              type='button'
              onClick={() => setActiveHistory(key)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${activeHistory === key ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 bg-white text-slate-700'}`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
        <div className='max-h-[360px] overflow-y-auto'>{renderHistoryRows()}</div>
      </div>

      <div className='bg-white mt-8'>
        <div className='mt-10 flex items-center gap-2.5 rounded-t border px-4 py-4'>
          <img src={assets.list_icon} alt='' />
          <p className='font-semibold'>Latest Bookings</p>
        </div>

        <div className='border border-t-0'>
          {dashData.latestAppointments.slice(0, 5).map((item, index) => (
            <div className='flex items-center px-6 py-3 gap-3 hover:bg-gray-100' key={index}>
              <img className='rounded-full w-10' src={item.userData?.image || DEFAULT_PROFILE_IMAGE} alt='' />
              <div className='flex-1 text-sm'>
                <p className='text-gray-800 font-medium'>{item.userData?.name || 'Unknown Patient'}</p>
                <p className='text-gray-600'>Booking on {slotDateFormat(item.slotDate)} at {item.slotTime}</p>
              </div>
              {item.cancelled ? (
                <p className='text-red-400 text-xs font-medium'>Cancelled</p>
              ) : item.isCompleted ? (
                <p className='text-green-500 text-xs font-medium'>Completed</p>
              ) : (
                <div className='flex gap-2'>
                  <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt='' />
                  <img onClick={() => completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt='' />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
