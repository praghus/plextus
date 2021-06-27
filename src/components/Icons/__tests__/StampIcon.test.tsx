import React from 'react'
import { shallow } from 'enzyme'

import StampIcon from '../StampIcon'

describe('<StampIcon />', () => {
    it('should render a SVG', () => {
        const renderedComponent = shallow(<StampIcon />)
        expect(renderedComponent.find('svg').length).toBe(1)
    })
})
