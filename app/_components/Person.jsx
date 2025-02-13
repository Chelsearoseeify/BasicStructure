'use client'

import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { getPerson } from '../_api/peopleService'

export default function Person() {
  const { data } = useSuspenseQuery({
    queryKey: ['person', '1'],
    queryFn: getPerson('1'),
    staleTime: 10 * 1000,
  })

  console.log(data)

  return (
    <>
      <h1>{data.name}</h1>
      
    </>
  )
}