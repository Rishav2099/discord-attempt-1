import InitialModal from '@/components/modals/initial-modal';
import { db } from '@/lib/db';
import { initialProfile } from '@/lib/initial-profile'
import { redirect } from 'next/navigation';
import React from 'react'

const page = async () => {

  const profile = await initialProfile();

  const server = await db.server.findFirst({
    where: {
      members: {
        some: {
          profileId: profile.id
        }
      }
    }
  })

  if(server) {
    return redirect(`/servers/${server.id}`)
  }

  return (
    <div className=''>
      <InitialModal />
    </div>
  )
}

export default page
