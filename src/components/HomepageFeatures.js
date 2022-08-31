import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: '优雅',
    Svg: require('../../static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        优雅的人，使用的工具也应该优雅一些
      </>
    ),
  },
  {
    title: '简单',
    Svg: require('../../static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        安装简单、操作简单、验证一个漏洞也是那么的简单
      </>
    ),
  },
  {
    title: '灵活',
    Svg: require('../../static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        灵活的组件，允许你对自己的灵感自定义
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
