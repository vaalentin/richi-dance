import Component from '../../core/Component'

const styles = require<{[name:string]: string}>('./Viewport.css')

export default class Viewport extends Component {
  constructor() {
    super('div', styles.viewport);
  }
}