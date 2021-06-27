import React from 'react'
import { shallow } from 'enzyme'

import EraserIcon from '../EraserIcon'

describe('<EraserIcon />', () => {
    it('should render a SVG', () => {
        const renderedComponent = shallow(<EraserIcon />)
        expect(renderedComponent.find('svg').length).toBe(1)
    })
})
