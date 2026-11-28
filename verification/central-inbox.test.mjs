import test from 'node:test';
import assert from 'node:assert/strict';
import {filterMessages,messageSite,messageSiteLabel} from '../src/app/message-utils.js';
test('old developer enquiries stay visible alongside all three sites',()=>{
 const messages=[{source:'/contact/',status:'read'},{site:'creator',status:'unread'},{site:'hub',status:'unread'}];
 assert.equal(filterMessages(messages).length,3);
 assert.equal(messageSite(messages[0]),'developer');
 assert.equal(filterMessages(messages,{site:'creator'})[0],messages[1]);
 assert.equal(filterMessages(messages,{site:'hub',status:'read'}).length,0);
 assert.equal(filterMessages(messages,{status:'unread'}).length,2);
});
test('origin detection uses a full hostname rather than matching deceptive URLs',()=>{
 assert.equal(messageSite({source:'https://creator.maskid.site/#contact'}),'creator');
 assert.equal(messageSite({source:'https://www.maskid.site/'}),'hub');
 assert.equal(messageSite({source:'https://evil.example/?creator.maskid.site'}),'developer');
 assert.equal(messageSiteLabel({site:'hub'}),'Main Hub');
});
