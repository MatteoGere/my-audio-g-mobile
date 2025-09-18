import { apiSlice, supabase } from './apiSlice';
import type { Tables, TablesInsert, TablesUpdate } from '../../types/supabase-types';

export const companiesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all companies
    getCompanies: builder.query<Tables<'company'>[], void>({
      queryFn: async () => {
        try {
          const { data, error } = await supabase.from('company').select('*');

          if (error) throw error;
          return { data: data || [] };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: ['Company'],
    }),

    // Get company by ID
    getCompany: builder.query<Tables<'company'>, string>({
      queryFn: async (id) => {
        try {
          const { data, error } = await supabase.from('company').select('*').eq('id', id).single();

          if (error) throw error;
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Company', id }],
    }),

    // Create company
    createCompany: builder.mutation<Tables<'company'>, TablesInsert<'company'>>({
      queryFn: async (company) => {
        try {
          const { data, error } = await supabase.from('company').insert(company).select().single();

          if (error) throw error;
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['Company'],
    }),

    // Update company
    updateCompany: builder.mutation<
      Tables<'company'>,
      { id: string; data: TablesUpdate<'company'> }
    >({
      queryFn: async ({ id, data }) => {
        try {
          const { data: result, error } = await supabase
            .from('company')
            .update(data)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;
          return { data: result };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Company', id }],
    }),

    // Delete company
    deleteCompany: builder.mutation<void, string>({
      queryFn: async (id) => {
        try {
          const { error } = await supabase.from('company').delete().eq('id', id);

          if (error) throw error;
          return { data: undefined };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: (result, error, id) => [{ type: 'Company', id }],
    }),
  }),
});

export const {
  useGetCompaniesQuery,
  useGetCompanyQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
} = companiesApi;
