import {ArrayValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {FieldDescription} from '../../api/search/fields/fields-response';
import {
  AsyncThunkSearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client';
import {ConfigurationSection} from '../../state/state-sections';
import {
  validatePayload,
  requiredNonEmptyString,
} from '../../utils/validate-payload';

const nonEmptyArray = new ArrayValue({
  each: requiredNonEmptyString,
  required: true,
});

export const registerFieldsToInclude = createAction(
  'fields/registerFieldsToInclude',
  (payload: string[]) => validatePayload<string[]>(payload, nonEmptyArray)
);

export const enableFetchAllFields = createAction('fields/fetchall/enable');

export const disableFetchAllFields = createAction('fields/fetchall/disable');

export const fetchFieldsDescription = createAsyncThunk<
  FieldDescription[],
  void,
  AsyncThunkSearchOptions<ConfigurationSection>
>('fields/fetchDescription', async (_, {extra, getState, rejectWithValue}) => {
  const state = getState();
  const {accessToken, organizationId} = state.configuration;
  const {apiBaseUrl} = state.configuration.search;
  const descriptions = await extra.apiClient.fieldDescriptions({
    accessToken,
    organizationId,
    url: apiBaseUrl,
  });
  if (isErrorResponse(descriptions)) {
    return rejectWithValue(descriptions.error);
  }
  return descriptions.success.fields;
});
