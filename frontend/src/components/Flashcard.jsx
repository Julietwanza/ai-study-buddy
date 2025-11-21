import React, { useState } from 'react';
export default function Flashcard({ question, answer }){
  const [flipped, setFlipped] = useState(false);
  return (
    <div className={`transform perspective-1000 ${flipped ? 'rotate-y-180' : ''}`} onClick={()=>setFlipped(!flipped)}>
      <div className='bg-slate-900 rounded p-4 h-40 flex flex-col justify-between cursor-pointer'>
        <div className='text-amber-300 font-semibold'>Question</div>
        <div className='text-sm'>{question}</div>
        <div className='text-emerald-300 font-semibold mt-2'>Answer</div>
        <div className='text-sm'>{flipped ? answer : ''}</div>
      </div>
    </div>
  )
}
