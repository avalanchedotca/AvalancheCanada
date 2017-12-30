import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import get from 'lodash/get'
import Layout from './Layout'
import { Control } from 'components/form'
import { DropdownFromOptions, Geocoder } from 'components/controls'
import { TAGS } from '../constants'

export default class Courses extends PureComponent {
    static propTypes = {
        tags: PropTypes.instanceOf(Set),
        place: PropTypes.object,
        onParamChange: PropTypes.func.isRequired,
    }
    state = {
        place: this.props.place,
        tags: this.props.tags,
    }
    handleParamChange = () => this.props.onParamChange(this.state)
    handleTagsChange = tags => this.setState({ tags }, this.handleParamChange)
    handlePlaceChange = place =>
        this.setState({ place }, this.handleParamChange)
    render() {
        return (
            <Layout legend="Find a provider">
                <Control>
                    <DropdownFromOptions
                        onChange={this.handleTagsChange}
                        value={this.state.tags}
                        placeholder="Filter by"
                        options={TAGS}
                    />
                </Control>
                <Control>
                    <Geocoder
                        placeholder="Location"
                        onChange={this.handlePlaceChange}
                        value={get(this.state, 'place.text')}
                    />
                </Control>
            </Layout>
        )
    }
}