package de.fhg.iais.roberta.visitor;

import com.google.common.collect.ClassToInstanceMap;

import de.fhg.iais.roberta.bean.IProjectBean;
import de.fhg.iais.roberta.components.ConfigurationAst;
import de.fhg.iais.roberta.visitor.collect.AbstractUsedHardwareCollectorVisitor;

public class OrbUsedHardwareCollectorVisitor extends AbstractUsedHardwareCollectorVisitor {

    public OrbUsedHardwareCollectorVisitor(ConfigurationAst configuration, ClassToInstanceMap<IProjectBean.IBuilder<?>> beanBuilders) {
        super(configuration, beanBuilders);
    }

}
