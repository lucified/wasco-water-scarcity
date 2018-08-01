import * as React from 'react';
import styled from 'styled-components';
import { CaretIcon } from '../../caret-icon';
import MultiSelector, { Option } from '../../generic/multi-selector';
import { SelectorDescription, SelectorHeader, theme } from '../../theme';

const Variable = styled.div`
  margin-bottom: ${theme.margin()};

  font-size: 14px;
  font-family: ${theme.labelFontFamily};
`;

const StyledMultiSelector = styled(MultiSelector)`
  margin-top: ${theme.margin(0.5)};
`;

const MoreInformationContainer = styled.div`
  margin-top: ${theme.margin(0.5)};
`;

const MoreInformationContent = styled.div`
  margin-bottom: ${theme.margin(0.5)};
`;

const MoreInformationLink = styled.a`
  display: block;
  cursor: pointer;
  color: ${theme.colors.gray};
  text-align: center;
`;

const StyledCaretIcon = styled(CaretIcon)`
  position: relative;
  top: 3px;
`;

interface Props {
  title: string;
  description?: string;
  furtherInformation?: JSX.Element;
  options?: Option[];
  selectedValue?: string;
  setModel?: (value: string) => void;
}

interface State {
  furtherInformationOpen: boolean;
}

export class ModelSelector extends React.Component<Props, State> {
  public state: State = {
    furtherInformationOpen: false,
  };

  private toggleFurtherInformation = () => {
    this.setState(state => ({
      furtherInformationOpen: !state.furtherInformationOpen,
    }));
  };

  public render() {
    const {
      title,
      description,
      options,
      furtherInformation,
      selectedValue,
      setModel,
    } = this.props;
    const { furtherInformationOpen } = this.state;

    return (
      <Variable>
        <SelectorHeader>{title}</SelectorHeader>
        {description && (
          <SelectorDescription>{description}</SelectorDescription>
        )}
        {options &&
          selectedValue && (
            <StyledMultiSelector
              options={options}
              selectedValue={selectedValue}
              onChangeSelect={setModel}
            />
          )}
        {furtherInformation && (
          <MoreInformationContainer>
            {furtherInformationOpen && (
              <MoreInformationContent>
                {furtherInformation}
              </MoreInformationContent>
            )}
            <MoreInformationLink onClick={this.toggleFurtherInformation}>
              {furtherInformationOpen ? (
                <span>
                  Hide{' '}
                  <StyledCaretIcon
                    direction="up"
                    color={theme.colors.gray}
                    width={16}
                    height={16}
                  />
                </span>
              ) : (
                <span>
                  Show more information{' '}
                  <StyledCaretIcon
                    direction="down"
                    color={theme.colors.gray}
                    width={16}
                    height={16}
                  />
                </span>
              )}
            </MoreInformationLink>
          </MoreInformationContainer>
        )}
      </Variable>
    );
  }
}
