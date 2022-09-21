import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import * as Yup from 'yup'

import { styled } from '@mui/material/styles'
import {
  Card, Container, Stack, Typography,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import Page from '@components/Page'
import {
  FormProvider, RHFCheckbox, RHFTextField, RHFSelect,
} from '@components/hook-form'

import useCompany from '@hooks/useCompany'

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(3, 0),
}))

function Company(props){
  const { isNew } = props
  const navigate = useNavigate()

  const { companyId } = useParams()

  const {
    callbacks: {
      createCompany: createFn,
      updateCompany: updateFn,
    },
    company,
  } = useCompany({ id: companyId })

  const CompanySchema = Yup.object().shape({
    name: Yup.string().required('Name required'),
    description: Yup.string().required('Description'),
    vip: Yup.string().required('VIP required'),

  })

  const defaultValues = {
    name: '',
    description: '',
    vip: '',
  }

  const statuses = [
    { label: 'Active', value: 'active' },
    { label: 'Banned', value: 'banned' },
  ]

  const methods = useForm({
    resolver: yupResolver(CompanySchema),
    defaultValues: { ...defaultValues, ...company },
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods

  const onSubmit = async (data) => {
    if (isNew){
      createFn(data).then(({ success, errors }) => {
        if (!success && errors){
          console.log('failed')
          return
        }

        navigate('/dashboard/companies', { replace: true })
      })
    } else {
      updateFn(data).then(({ success, errors }) => {
        if (!success && errors){
          console.log('failed')
          return
        }

        navigate('/dashboard/companies', { replace: true })
      })
    }
  }

  return (
    <Page title="Company">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            {isNew ? 'Create' : 'Update'} Company
          </Typography>
        </Stack>
        <Card>
          <Container>
            <ContentStyle>
              <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2}>
                  <RHFTextField name="name" label="Name" />
                  <RHFTextField name="description" label="Description" />
                  <RHFTextField name="vip" label="VIP" />
                  <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
                    {isNew ? 'Create' : 'Update'}
                  </LoadingButton>
                </Stack>
              </FormProvider>
            </ContentStyle>
          </Container>
        </Card>
      </Container>
    </Page>
  )
}

Company.propTypes = {
  isNew: PropTypes.bool,
}

export default Company
