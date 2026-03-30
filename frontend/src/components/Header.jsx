import React from 'react'

function Header({ lang }) {
  return (
    <h1 style={{ textAlign: 'center' }}>
      {lang === 'en' ? "Who's going to be next arrested?" : "अर्को को पक्राउ पर्छ?"}
    </h1>
  )
}

export default Header