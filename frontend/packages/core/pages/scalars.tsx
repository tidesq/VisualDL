import ChartPage, {WithChart} from '~/components/ChartPage';
import {NextI18NextPage, useTranslation} from '~/utils/i18n';
import React, {useCallback, useMemo, useState} from 'react';
import {sortingMethodMap, xAxisMap} from '~/resource/scalars';

import {AsideSection} from '~/components/Aside';
import Checkbox from '~/components/Checkbox';
import Content from '~/components/Content';
import Error from '~/components/Error';
import Field from '~/components/Field';
import Preloader from '~/components/Preloader';
import RadioButton from '~/components/RadioButton';
import RadioGroup from '~/components/RadioGroup';
import RunAside from '~/components/RunAside';
import ScalarChart from '~/components/ScalarsPage/ScalarChart';
import Select from '~/components/Select';
import Slider from '~/components/Slider';
import {Tag} from '~/types';
import Title from '~/components/Title';
import {rem} from '~/utils/style';
import styled from 'styled-components';
import useTagFilter from '~/hooks/useTagFilter';

type XAxis = keyof typeof xAxisMap;
const xAxisValues = ['step', 'relative', 'wall'] as const;
type TooltipSorting = keyof typeof sortingMethodMap;
const toolTipSortingValues = ['default', 'descending', 'ascending', 'nearest'] as const;

const TooltipSortingDiv = styled.div`
    margin-top: ${rem(20)};
    display: flex;
    align-items: center;

    > :last-child {
        margin-left: ${rem(20)};
        flex-shrink: 1;
        flex-grow: 1;
    }
`;

const Scalars: NextI18NextPage = () => {
    const {t} = useTranslation(['scalars', 'common']);

    const [running, setRunning] = useState(true);

    const {runs, tags, selectedRuns, onChangeRuns, loadingRuns, loadingTags} = useTagFilter('scalars', running);

    const [smoothing, setSmoothing] = useState(0.6);

    const [xAxis, setXAxis] = useState<XAxis>(xAxisValues[0]);

    const [tooltipSorting, setTooltipSorting] = useState<TooltipSorting>(toolTipSortingValues[0]);

    const [ignoreOutliers, setIgnoreOutliers] = useState(false);

    const aside = useMemo(
        () =>
            runs.length ? (
                <RunAside
                    runs={runs}
                    selectedRuns={selectedRuns}
                    onChangeRuns={onChangeRuns}
                    running={running}
                    onToggleRunning={setRunning}
                >
                    <AsideSection>
                        <Checkbox value={ignoreOutliers} onChange={setIgnoreOutliers}>
                            {t('scalars:ignore-outliers')}
                        </Checkbox>
                        <TooltipSortingDiv>
                            <span>{t('scalars:tooltip-sorting')}</span>
                            <Select
                                list={toolTipSortingValues.map(value => ({
                                    label: t(`tooltip-sorting-value.${value}`),
                                    value
                                }))}
                                value={tooltipSorting}
                                onChange={setTooltipSorting}
                            />
                        </TooltipSortingDiv>
                    </AsideSection>
                    <AsideSection>
                        <Field label={t('scalars:smoothing')}>
                            <Slider min={0} max={0.99} step={0.01} value={smoothing} onChangeComplete={setSmoothing} />
                        </Field>
                    </AsideSection>
                    <AsideSection>
                        <Field label={t('scalars:x-axis')}>
                            <RadioGroup value={xAxis} onChange={setXAxis}>
                                {xAxisValues.map(value => (
                                    <RadioButton key={value} value={value}>
                                        {t(`x-axis-value.${value}`)}
                                    </RadioButton>
                                ))}
                            </RadioGroup>
                        </Field>
                    </AsideSection>
                </RunAside>
            ) : null,
        [t, ignoreOutliers, onChangeRuns, running, runs, selectedRuns, smoothing, tooltipSorting, xAxis]
    );

    const withChart = useCallback<WithChart<Tag>>(
        ({label, runs, ...args}) => (
            <ScalarChart
                runs={runs}
                tag={label}
                {...args}
                smoothing={smoothing}
                xAxis={xAxis}
                sortingMethod={tooltipSorting}
                outlier={ignoreOutliers}
                running={running}
            />
        ),
        [smoothing, xAxis, tooltipSorting, ignoreOutliers, running]
    );

    return (
        <>
            <Preloader url="/runs" />
            <Preloader url="/scalars/tags" />
            <Title>{t('common:scalars')}</Title>
            <Content aside={aside} loading={loadingRuns}>
                {!loadingRuns && !runs.length ? (
                    <Error />
                ) : (
                    <ChartPage items={tags} withChart={withChart} loading={loadingRuns || loadingTags} />
                )}
            </Content>
        </>
    );
};

Scalars.getInitialProps = () => ({
    namespacesRequired: ['scalars', 'common']
});

export default Scalars;
