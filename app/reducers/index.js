import { combineReducers } from 'redux'
import { postsByReddit, selectedReddit } from './expense';

export default combineReducers({
  postsByReddit,
  selectedReddit
})