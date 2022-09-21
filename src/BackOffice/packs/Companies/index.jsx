import React from 'react'
import { filter } from 'lodash'
import { Link as RouterLink } from 'react-router-dom'

import { useSelector } from 'react-redux'
import {
 Button, Card, Checkbox, Container, Stack,
  Table, TableRow, TableBody, TableCell, Typography, TableContainer, TablePagination,
} from '@mui/material'

import useReduxAction from '@hooks/useReduxAction'
import useSetState from '@hooks/useSetState'
import useCompany from '@hooks/useCompany'

import Iconify from '@components/Iconify'
import Page from '@components/Page'
import Scrollbar from '@components/Scrollbar'
import SearchNotFound from '@components/SearchNotFound'

import PageContext from '@contexts/pageContext'

import { CompanyListHead, CompanyListToolbar, CompanyMoreMenu } from './components'
// function Companies(){
//   return (

//     <div>test</div>
//   )
// }
// export default Companies

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'description', label: 'Description', alignRight: false },
  { id: 'vip', label: 'VIP', alignRight: false },
  { id: '' },
]

function descendingComparator(a, b, orderBy){
  if (b[orderBy] < a[orderBy]){
    return -1
  }
  if (b[orderBy] > a[orderBy]){
    return 1
  }
  return 0
}

function getComparator(order, orderBy){
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

function applySortFilter(array, comparator, query){
  const stabilizedThis = array.map((el, index) => [el, index])
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })
  if (query){
    return filter(array, _company => _company.name.toLowerCase().indexOf(query.toLowerCase()) !== -1)
  }
  return stabilizedThis.map(el => el[0])
}

const defaultState = {
  filterName: '',
  order: 'asc',
  orderBy: 'name',
  page: 0,
  rowsPerPage: 5,
  selected: [],
}

function Companies(){
  const [state, setState] = useSetState(defaultState)
  const { filterName, order, orderBy, page, rowsPerPage, selected } = state

  useReduxAction('companies', 'loadCompanies', {}, [], {
    shouldPerformFn: (entityReducer) => {
      const { errors, loaded, loading } = entityReducer
      return !loaded && !loading && !errors.length
    },
  })

  const entities = useSelector(reduxState => reduxState.entities)
  const { companies } = entities

  const {
    callbacks: {
      deleteCompany: deleteFn,
    },
  } = useCompany()

  const pageContext = {
    callbacks: {
      deleteCompany: (company) => {
        deleteFn(company).then(({ success, errors }) => {
          if (!success && errors){
            console.log('failed')
          }
        })
      },
    },
  }
// console.log(pageContext)
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setState({
      order: isAsc ? 'desc' : 'asc',
      orderBy: property,
    })
  }

  const handleSelectAllClick = (event) => {
    if (event.target.checked){
      const newSelecteds = Object.values(companies).map(n => n.name)
      setState({ selected: newSelecteds })
      return
    }
    setState({ selected: [] })
  }

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name)
    let newSelected = []
    if (selectedIndex === -1){
      newSelected = newSelected.concat(selected, name)
    } else if (selectedIndex === 0){
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1){
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0){
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1))
    }
    setState({ selected: newSelected })
  }

  const handleChangePage = (event, newPage) => {
    setState({ page: newPage })
  }

  const handleChangeRowsPerPage = (event) => {
    setState({
      page: 0,
      rowsPerPage: parseInt(event.target.value, 10),
    })
  }

  const handleFilterByName = (event) => {
    setState({ filterName: event.target.value })
  }

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - Object.values(companies).length) : 0

  const filteredCompanies = applySortFilter(Object.values(companies), getComparator(order, orderBy), filterName)

  const isCompaniesNotFound = filteredCompanies.length === 0

  return (
    <PageContext.Provider value={pageContext}>
      <Page title="Companies">
        <Container>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              Company
            </Typography>
            <Button variant="contained" component={RouterLink} to="/dashboard/companies/new" startIcon={<Iconify icon="eva:plus-fill" />}>
              Create Company
            </Button>
          </Stack>

          <Card>
            <CompanyListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

            <Scrollbar>
              <TableContainer sx={{ minWidth: 800 }}>
                <Table>
                  <CompanyListHead
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={Object.values(companies).length}
                    numSelected={selected.length}
                    onRequestSort={handleRequestSort}
                    onSelectAllClick={handleSelectAllClick}
                  />
                  <TableBody>
                    {filteredCompanies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const { id, name, description, vip } = row
                      const isItemSelected = selected.indexOf(name) !== -1

                      return (
                        <TableRow
                          hover
                          key={id}
                          tabIndex={-1}
                          role="checkbox"
                          selected={isItemSelected}
                          aria-checked={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox checked={isItemSelected} onChange={event => handleClick(event, name)} />
                          </TableCell>
                          <TableCell align="left">{name}</TableCell>
                          <TableCell align="left">{description}</TableCell>
                          <TableCell align="left">{vip}</TableCell>
                          <TableCell align="right">
                            <CompanyMoreMenu company={row} />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>

                  {isCompaniesNotFound && (
                    <TableBody>
                      <TableRow>
                        <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                          <SearchNotFound searchQuery={filterName} />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  )}
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={Object.values(companies).length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Card>
        </Container>
      </Page>
    </PageContext.Provider>
  )
}
export default Companies
