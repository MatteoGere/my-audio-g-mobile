import { apiSlice } from './apiSlice'
import type { Tables, TablesInsert, TablesUpdate } from '../../types/supabase-types'

export const companiesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all companies
    getCompanies: builder.query<Tables<'company'>[], void>({
      query: () => 'company?select=*',
      providesTags: ['Company'],
    }),
    
    // Get company by ID
    getCompany: builder.query<Tables<'company'>, string>({
      query: (id) => `company?id=eq.${id}&select=*`,
      transformResponse: (response: Tables<'company'>[]) => response[0],
      providesTags: (result, error, id) => [{ type: 'Company', id }],
    }),
    
    // Create company
    createCompany: builder.mutation<Tables<'company'>, TablesInsert<'company'>>({
      query: (company) => ({
        url: 'company',
        method: 'POST',
        body: company,
      }),
      invalidatesTags: ['Company'],
    }),
    
    // Update company
    updateCompany: builder.mutation<Tables<'company'>, { id: string; data: TablesUpdate<'company'> }>({
      query: ({ id, data }) => ({
        url: `company?id=eq.${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Company', id }],
    }),
    
    // Delete company
    deleteCompany: builder.mutation<void, string>({
      query: (id) => ({
        url: `company?id=eq.${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Company', id }],
    }),
  }),
})

export const {
  useGetCompaniesQuery,
  useGetCompanyQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
} = companiesApi