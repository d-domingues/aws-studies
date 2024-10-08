import { del, get, post, put } from 'aws-amplify/api';
// import amplifyconfig from './amplifyconfiguration.json';
import { Question } from './types';

const apiName = ''; // amplifyconfig.aws_cloud_logic_custom[0].name;
const path = '/questions';

export async function getQuestions() {
  // return questions;

  try {
    const restOperation = get({
      apiName,
      path,
    });

    const { body } = await restOperation.response;
    return (await body.json()) as Question[];
  } catch (error) {
    console.log('GET call failed: ', error);
    return [];
  }
}

export async function addQuestion(item: Question) {
  try {
    const restOperation = post({
      apiName,
      path,
      options: {
        body: item,
      },
    });

    const { body } = await restOperation.response;
    const response = await body.json();

    console.log('POST call succeeded', response);
  } catch (e) {
    console.log('POST call failed: ', e);
  }
}

export async function getItems() {
  try {
    const restOperation = get({
      apiName,
      path,
    });

    const { body } = await restOperation.response;
    console.log('GET call succeeded: ', await body.json());
  } catch (error) {
    console.log('GET call failed: ', error);
  }
}

export async function getItem(itemId: string) {
  try {
    const restOperation = get({
      apiName,
      path: `/items/${itemId}`, // Assuming `/items/{col1}` fetches an item by `col1`
    });

    const { body } = await restOperation.response;
    console.log('GET call succeeded: ', await body.json());
  } catch (e) {
    console.log('GET call failed: ', e);
  }
}

export async function updateItem(data: any) {
  data = {
    col1: '123',
    col2: 'ItemX',
  };

  try {
    const restOperation = put({
      apiName,
      path: `/items`,
      options: {
        body: data,
      },
    });

    const { body } = await restOperation.response;
    console.log('PUT call succeeded: ', await body.json());
  } catch (error) {
    console.log('PUT call failed: ', error);
  }
}

export async function deleteItem(itemId: string) {
  try {
    const delOperation = del({
      apiName,
      path: `/items/object/${itemId}`, // Assuming `/items/{col1}` deletes an item by `col1`
    });

    const resp = await delOperation.response;

    console.log('Item deleted:', resp.statusCode);
  } catch (error) {
    console.error('Error deleting item:', error);
  }
}
