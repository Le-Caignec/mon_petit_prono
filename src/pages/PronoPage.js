import './pronoPage.css'
import NavMenu from '../components/pronoPage/NavMenu'
import { Breadcrumb, Container, Row } from 'react-bootstrap'
import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MonPetitPronoContract } from '../utils/WebProvider'

export default function TeamPage() {
  const { leagueId, leagueName, teamName, teamId } = useParams()

  return (
    <div id="teamPage">
      <NavMenu />
      <Container fluid id="ttt">
        <Breadcrumb>
          <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
          <Breadcrumb.Item href={`/${leagueId}/${leagueName}`}>
            {leagueName}
          </Breadcrumb.Item>
          <Breadcrumb.Item href="">{teamName}</Breadcrumb.Item>
        </Breadcrumb>
      </Container>
      <Outlet />
    </div>
  )
}
