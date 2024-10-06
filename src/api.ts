import { del, get, post, put } from 'aws-amplify/api';
import amplifyconfig from './amplifyconfiguration.json';

const apiName = amplifyconfig.aws_cloud_logic_custom[0].name;
const path = '/items';

export async function createItem(item: any) {
  try {
    const restOperation = post({
      apiName,
      path,
      options: {
        body: item,
        headers: {},
      },
    });

    const { body } = await restOperation.response;
    console.log('POST call succeeded', await body.json());
  } catch (error) {
    console.log('POST call failed: ', error);
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
    console.log('GET call failed: ', JSON.parse(e.response.body));
  }
}

export async function updateItem(data: any) {
  try {
    const restOperation = put({
      apiName,
      path: `/items`,
      options: {
        body: {
          col1: '123',
          col2: 'ItemX',
        },
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
